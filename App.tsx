import React, { useState } from 'react';
import Header from './components/Header.js';
import IngredientInput from './components/IngredientInput.js';
import RecipeDisplay from './components/RecipeDisplay.js';
import Loader from './components/Loader.js';
import ErrorMessage from './components/ErrorMessage.js';
import { generateRecipe, generateImage, generateVariations } from './services/geminiService.js';
import { Recipe } from './types.js';

function App() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [variationsMap, setVariationsMap] = useState<Record<string, string>>({});
  const [loadingVariationsMap, setLoadingVariationsMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  const handleGenerateRecipe = async (data: { ingredients: string[], dietaryRestrictions: string[], recipeCount: number }) => {
    setIsLoading(true);
    setError(null);
    setRecipes(null);
    setImageUrls({});
    setImageErrors({});
    setVariationsMap({});
    setLoadingVariationsMap({});
    try {
      setProgressStep(0); // Analyzing ingredients
      await new Promise(resolve => setTimeout(resolve, 500)); 

      setProgressStep(1); // Generating recipes text
      const newRecipes = await generateRecipe(data.ingredients, data.dietaryRestrictions, data.recipeCount);
      
      // Show recipes text first and stop the main loader
      setRecipes(newRecipes);
      setIsLoading(false);

      // Generate images in the background and update UI as they complete
      newRecipes.forEach(async (recipe) => {
        try {
            const imageUrl = await generateImage(recipe.title);
            setImageUrls(prev => ({ ...prev, [recipe.title]: imageUrl }));
        } catch (imgError) {
            console.error(`Failed to generate image for ${recipe.title}:`, imgError);
            setImageErrors(prev => ({ ...prev, [recipe.title]: true }));
        }
      });

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setIsLoading(false); // Ensure loader is off on error
    }
  };
  
  const handleGenerateVariations = async (recipe: Recipe) => {
    if (!recipe) return;
    setLoadingVariationsMap(prev => ({ ...prev, [recipe.title]: true }));
    setVariationsMap(prev => ({ ...prev, [recipe.title]: '' }));
    try {
        const newVariations = await generateVariations(recipe);
        setVariationsMap(prev => ({ ...prev, [recipe.title]: newVariations }));
    } catch (err: any) {
        console.error("Failed to get variations:", err);
    } finally {
        setLoadingVariationsMap(prev => ({ ...prev, [recipe.title]: false }));
    }
  };

  const handleClearAll = () => {
    setRecipes(null);
    setImageUrls({});
    setImageErrors({});
    setVariationsMap({});
    setLoadingVariationsMap({});
    setIsLoading(false);
    setError(null);
    setProgressStep(0);
  };

  return (
    <div className="min-h-screen bg-emerald-50 font-sans text-gray-800">
      <main className="container mx-auto px-4 py-8">
        <Header />
        <IngredientInput onGenerateRecipe={handleGenerateRecipe} isLoading={isLoading} onClearAll={handleClearAll} />
        {isLoading && <Loader step={progressStep} />}
        {error && <ErrorMessage message={error} />}
        {recipes && (
            <div className="space-y-8">
                {recipes.map(recipe => (
                    <RecipeDisplay 
                        key={recipe.title}
                        recipe={recipe} 
                        imageUrl={imageUrls[recipe.title] || null}
                        isImageError={imageErrors[recipe.title] || false}
                        variations={variationsMap[recipe.title] || null}
                        isLoadingVariations={loadingVariationsMap[recipe.title] || false}
                        onGenerateVariations={() => handleGenerateVariations(recipe)}
                    />
                ))}
            </div>
        )}
      </main>
    </div>
  );
}

export default App;