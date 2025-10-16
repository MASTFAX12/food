import React from 'react';
import { Recipe } from '../types.js';

interface RecipeDisplayProps {
    recipe: Recipe;
    imageUrl: string | null;
    variations: string | null;
    isLoadingVariations: boolean;
    onGenerateVariations: () => void;
}

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3 p-2 bg-gray-100/60 rounded-lg flex-1 min-w-[130px] justify-center sm:justify-start">
            <div className="flex-shrink-0 text-emerald-600">{icon}</div>
            <div>
                <p className="text-sm font-bold text-gray-500">{label}</p>
                <p className="text-md font-semibold text-emerald-800">{value}</p>
            </div>
        </div>
    );
};

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, imageUrl, variations, isLoadingVariations, onGenerateVariations }) => {
    return (
        <div className="mt-8 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-lg transition-shadow hover:shadow-xl" dir="rtl">
            
            {imageUrl ? (
                <div className="mb-6 rounded-xl overflow-hidden aspect-video">
                    <img src={imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="mb-6 rounded-xl bg-gray-200 animate-pulse w-full aspect-video flex items-center justify-center">
                    <span className="text-gray-500">جاري تحضير الصورة...</span>
                </div>
            )}
            
            <div className="px-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-emerald-800 mb-3">{recipe.title}</h2>
                <p className="text-gray-600 text-lg mb-6">{recipe.description}</p>
            </div>


            <div className="flex flex-wrap gap-3 sm:gap-4 text-center mb-8 border-y py-5 px-2">
                <InfoItem 
                    label="وقت التحضير" 
                    value={recipe.prepTime} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <InfoItem 
                    label="تكفي لـ" 
                    value={recipe.servings}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                 <InfoItem 
                    label="السعرات" 
                    value={recipe.calories}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.C14.05 5.02 16 7.464 16 10c0-1.887-1.343-3.414-3-3.414S10 8.113 10 10c0 3.314 2.686 6 6 6s6-2.686 6-6c0-2.318-1.343-4.314-3.222-5.186" /></svg>}
                />
                 <InfoItem label="البروتين" value={recipe.protein} icon={<strong>غ</strong>} />
                 <InfoItem label="الكربوهيدرات" value={recipe.carbs} icon={<strong>غ</strong>} />
                 <InfoItem label="الدهون" value={recipe.fat} icon={<strong>غ</strong>} />
            </div>

            <div className="bg-emerald-50/40 p-4 sm:p-6 rounded-xl">
                 <div className="grid md:grid-cols-5 gap-8">
                    <div className="md:col-span-2 mb-6">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-r-4 border-emerald-500 pr-3">المكونات</h3>
                        <ul className="space-y-3">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="inline-flex items-center justify-center w-5 h-5 mt-1 ml-3 bg-emerald-100 rounded-full flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    <span className="text-gray-700">{ingredient}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-3 mb-8">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-r-4 border-emerald-500 pr-3">طريقة التحضير</h3>
                        <ol className="space-y-4">
                             {recipe.instructions.map((instruction, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="flex items-center justify-center w-6 h-6 ml-3 font-bold text-sm text-white bg-emerald-600 rounded-full flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-700 leading-relaxed">{instruction}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>


            <div className="border-t mt-8 pt-6 px-2">
                 <h3 className="text-2xl font-semibold text-gray-800 mb-4">تنويعات مقترحة</h3>
                 {!variations && !isLoadingVariations && (
                    <button 
                        onClick={onGenerateVariations}
                        className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition"
                    >
                        اقترح تنويعات!
                    </button>
                 )}
                 {isLoadingVariations && <p className="text-gray-500 animate-pulse">جاري البحث عن أفكار إبداعية...</p>}
                 {variations && (
                    <div className="mt-4 flex p-4 bg-amber-50/60 border-r-4 border-amber-400 rounded-lg">
                        <div className="ml-3 flex-shrink-0">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </div>
                        <div className="whitespace-pre-wrap text-amber-900 text-base">
                            {variations}
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default RecipeDisplay;
