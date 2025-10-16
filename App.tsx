import React, { useState, useEffect } from 'react';
import Header from './components/Header.js';
import IngredientInput from './components/IngredientInput.js';
import RecipeDisplay from './components/RecipeDisplay.js';
import Loader from './components/Loader.js';
import ErrorMessage from './components/ErrorMessage.js';
import ApiKeySelector from './components/ApiKeySelector.js';
import { generateRecipe, generateImage, generateVariations } from './services/geminiService.js';
import { Recipe } from './types.js';

// إضافة تعريف نوع لـ aistudio
// FIX: Defined a named interface `AIStudio` to avoid conflicts with other global declarations.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // FIX: Made `aistudio` optional as it's only available in the AI Studio environment, resolving the declaration modifier error.
    aistudio?: AIStudio;
  }
}

function App() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [variationsMap, setVariationsMap] = useState<Record<string, string>>({});
  const [loadingVariationsMap, setLoadingVariationsMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  const [isApiKeyReady, setIsApiKeyReady] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);

  // تحقق مما إذا كنا في بيئة AI Studio
  const isAiStudioEnvironment = !!window.aistudio;

  useEffect(() => {
    const checkApiKey = async () => {
      // تحقق من مفتاح AI Studio فقط إذا كان الكائن موجودًا
      if (isAiStudioEnvironment) {
        try {
          if (await window.aistudio!.hasSelectedApiKey()) {
            setIsApiKeyReady(true);
          }
        } catch (e) {
          console.error("Error checking for AI Studio API key:", e);
        } finally {
          setIsCheckingApiKey(false);
        }
      } else {
        // في بيئات أخرى (مثل Netlify)، نفترض أن المفتاح تم تعيينه عبر متغيرات البيئة.
        // لا يمكننا التحقق منه مباشرة، لذلك نمضي قدمًا. إذا كان مفقودًا، ستفشل استدعاءات API.
        setIsApiKeyReady(true);
        setIsCheckingApiKey(false);
      }
    };
    checkApiKey();
  }, [isAiStudioEnvironment]);


  const handleApiError = (err: any) => {
    const errorMessage = err.message || 'An unknown error occurred.';

    // أخطاء محددة لمفتاح API
    if (errorMessage === 'API_KEY_RESET_REQUIRED' || errorMessage === 'INVALID_API_KEY') {
      if (isAiStudioEnvironment) {
        // إذا كنت في AI studio، اطلب تحديد مفتاح آخر.
        setIsApiKeyReady(false);
        setError('مفتاح API المحدد غير صالح أو لم يتم العثور عليه. يرجى تحديد مفتاح آخر.');
      } else {
        // إذا كنت على Netlify/مستقل، أخبرهم بالتحقق من متغيرات البيئة.
        setError("خطأ في إعدادات واجهة برمجة التطبيقات (API). يبدو أن مفتاح API الخاص بك مفقود أو غير صالح في بيئة النشر. يرجى التأكد من إضافة متغير بيئة `API_KEY` بشكل صحيح في إعدادات موقعك على منصة النشر.");
      }
    } else {
      // خطأ عام للمشكلات الأخرى.
      setError(errorMessage);
    }
  };
  
  const handleGenerateRecipe = async (data: { ingredients: string[], dietaryRestrictions: string[], recipeCount: number }) => {
    setIsLoading(true);
    setError(null);
    setRecipes(null);
    setImageUrls({});
    setImageErrors({});
    setVariationsMap({});
    setLoadingVariationsMap({});
    try {
      setProgressStep(0); // تحليل المكونات
      await new Promise(resolve => setTimeout(resolve, 500)); 

      setProgressStep(1); // إنشاء نصوص الوصفات
      const newRecipes = await generateRecipe(data.ingredients, data.dietaryRestrictions, data.recipeCount);
      
      // إظهار نصوص الوصفات أولاً وإيقاف المحمل الرئيسي
      setRecipes(newRecipes);
      setIsLoading(false);

      // إنشاء الصور في الخلفية وتحديث الواجهة عند اكتمالها
      newRecipes.forEach(async (recipe) => {
        try {
            const imageUrl = await generateImage(recipe.title);
            setImageUrls(prev => ({ ...prev, [recipe.title]: imageUrl }));
        } catch (imgError) {
            console.error(`Failed to generate image for ${recipe.title}:`, imgError);
            handleApiError(imgError); // استخدام المعالج المركزي
            setImageErrors(prev => ({ ...prev, [recipe.title]: true }));
        }
      });

    } catch (err: any) {
      handleApiError(err); // استخدام المعالج المركزي
      setIsLoading(false); // التأكد من إيقاف المحمل عند حدوث خطأ
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
        handleApiError(err); // استخدام المعالج المركزي
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

  const renderContent = () => {
    if (isCheckingApiKey) {
      return <div className="text-center p-8">جاري التحقق من إعدادات واجهة برمجة التطبيقات...</div>;
    }

    // في AI Studio، أظهر أداة التحديد إذا لم يكن المفتاح جاهزًا.
    if (isAiStudioEnvironment && !isApiKeyReady) {
      return <ApiKeySelector onKeySelected={() => {
          setIsApiKeyReady(true);
          setError(null); // مسح الأخطاء السابقة
      }} />;
    }

    // في جميع الحالات الأخرى (Netlify، أو AI Studio مع مفتاح جاهز)، أظهر التطبيق الرئيسي.
    return (
      <>
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
      </>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 font-sans text-gray-800">
      <main className="container mx-auto px-4 py-8">
        <Header />
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
