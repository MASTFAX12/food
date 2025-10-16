import React from 'react';
import { Recipe } from '../types';

interface RecipeDisplayProps {
    recipe: Recipe;
    imageUrl: string | null;
    variations: string | null;
    isLoadingVariations: boolean;
    onGenerateVariations: () => void;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, imageUrl, variations, isLoadingVariations, onGenerateVariations }) => {
    return (
        <div className="mt-8 w-full max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg" dir="rtl">
            
            {imageUrl ? (
                <div className="mb-6 rounded-lg overflow-hidden">
                    <img src={imageUrl} alt={recipe.title} className="w-full h-auto object-cover" />
                </div>
            ) : (
                <div className="mb-6 rounded-lg bg-gray-200 animate-pulse w-full h-64 flex items-center justify-center">
                    <span className="text-gray-500">جاري تحضير الصورة...</span>
                </div>
            )}
            
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-4">{recipe.title}</h2>
            <p className="text-gray-600 mb-6">{recipe.description}</p>

            <div className="flex flex-wrap gap-4 text-center mb-6 border-y py-4">
                <div className="flex-1 min-w-[100px]">
                    <p className="font-bold text-gray-700">وقت التحضير</p>
                    <p className="text-emerald-600">{recipe.prepTime}</p>
                </div>
                <div className="flex-1 min-w-[100px]">
                    <p className="font-bold text-gray-700">تكفي لـ</p>
                    <p className="text-emerald-600">{recipe.servings}</p>
                </div>
                {recipe.calories && (
                    <div className="flex-1 min-w-[100px]">
                        <p className="font-bold text-gray-700">السعرات</p>
                        <p className="text-emerald-600">{recipe.calories}</p>
                    </div>
                )}
                 {recipe.protein && (
                     <div className="flex-1 min-w-[100px]">
                        <p className="font-bold text-gray-700">البروتين</p>
                        <p className="text-emerald-600">{recipe.protein}</p>
                    </div>
                )}
                 {recipe.carbs && (
                     <div className="flex-1 min-w-[100px]">
                        <p className="font-bold text-gray-700">الكربوهيدرات</p>
                        <p className="text-emerald-600">{recipe.carbs}</p>
                    </div>
                )}
                {recipe.fat && (
                     <div className="flex-1 min-w-[100px]">
                        <p className="font-bold text-gray-700">الدهون</p>
                        <p className="text-emerald-600">{recipe.fat}</p>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-x-8">
                <div className="mb-6">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">المكونات</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </div>

                <div className="mb-8">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">طريقة التحضير</h3>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        {recipe.instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                        ))}
                    </ol>
                </div>
            </div>

            <div className="border-t pt-6">
                 <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">تنويعات مقترحة</h3>
                 {!variations && (
                    <button 
                        onClick={onGenerateVariations}
                        disabled={isLoadingVariations}
                        className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition disabled:bg-amber-300"
                    >
                         {isLoadingVariations ? 'جاري التفكير...' : 'اقترح تنويعات!'}
                    </button>
                 )}
                 {isLoadingVariations && <p className="text-gray-500">جاري البحث عن أفكار إبداعية...</p>}
                 {variations && (
                    <div className="whitespace-pre-wrap bg-gray-100 p-4 rounded-lg text-gray-700">
                        {variations}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default RecipeDisplay;