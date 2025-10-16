import React, { useState, useEffect, useRef } from 'react';

// SpeechRecognition types for browsers that support it.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface IngredientInputProps {
    onGenerateRecipe: (data: { ingredients: string[], dietaryRestrictions: string[] }) => void;
    isLoading: boolean;
    onClearAll: () => void;
}

const DIETARY_RESTRICTIONS = [
    { id: 'vegetarian', label: 'نباتي' },
    { id: 'vegan', label: 'نباتي صرف (فيجن)' },
    { id: 'gluten-free', label: 'خالي من الغلوتين' },
    { id: 'dairy-free', label: 'خالي من الألبان' },
    { id: 'low-carb', label: 'قليل الكربوهيدرات' },
];

const INGREDIENT_CATEGORIES = {
    'خضروات': ['طماطم', 'بصل', 'ثوم', 'بطاطس', 'جزر', 'فلفل حلو', 'خيار', 'باذنجان', 'كوسة', 'سبانخ', 'بروكلي', 'فطر', 'خس', 'ذرة'],
    'فواكه': ['ليمون', 'تفاح', 'موز', 'برتقال', 'أفوكادو', 'مانجو', 'زيتون', 'تمر'],
    'لحوم ودواجن': ['صدر دجاج', 'لحم بقري مفروم', 'فخذ دجاج', 'ستيك لحم', 'نقانق', 'دجاج كامل', 'لحم غنم'],
    'أسماك ومأكولات بحرية': ['سمك فيليه', 'جمبري', 'سلمون', 'تونة معلبة'],
    'بقوليات وحبوب': ['أرز', 'عدس', 'حمص', 'فاصوليا', 'معكرونة', 'برغل', 'كينوا', 'شوفان', 'خبز'],
    'منتجات الألبان والبيض': ['بيض', 'حليب', 'جبن شيدر', 'جبن موزاريلا', 'زبادي', 'زبدة', 'قشطة', 'لبنة'],
    'بهارات وتوابل': ['ملح', 'فلفل أسود', 'كمون', 'كزبرة', 'كركم', 'بابريكا', 'قرفة', 'زعتر', 'ورق غار', 'فلفل حار', 'زنجبيل', 'هيل'],
    'معلبات وصلصات': ['معجون طماطم', 'كاتشب', 'مايونيز', 'خردل', 'صلصة الصويا', 'مرقة دجاج', 'خل'],
    'مكسرات وزيوت': ['زيت زيتون', 'زيت نباتي', 'لوز', 'جوز', 'طحينة', 'سمسم'],
};


const IngredientInput: React.FC<IngredientInputProps> = ({ onGenerateRecipe, isLoading, onClearAll }) => {
    const [currentIngredient, setCurrentIngredient] = useState('');
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDietaryDropdownOpen, setIsDietaryDropdownOpen] = useState(false);
    const dietaryDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dietaryDropdownRef.current && !dietaryDropdownRef.current.contains(event.target as Node)) {
                setIsDietaryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddIngredient = () => {
        if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
            setIngredients([...ingredients, currentIngredient.trim()]);
            setCurrentIngredient('');
        }
    };

    const handleAddIngredientFromModal = (ingredient: string) => {
        if (!ingredients.includes(ingredient)) {
            setIngredients(prev => [...prev, ingredient]);
        }
    };

    const handleRemoveIngredient = (ingredientToRemove: string) => {
        setIngredients(ingredients.filter(ingredient => ingredient !== ingredientToRemove));
    };

    const handleDietaryChange = (restrictionId: string) => {
        const restrictionLabel = DIETARY_RESTRICTIONS.find(r => r.id === restrictionId)?.label;
        if (!restrictionLabel) return;

        setDietaryRestrictions(prev =>
            prev.includes(restrictionLabel)
                ? prev.filter(item => item !== restrictionLabel)
                : [...prev, restrictionLabel]
        );
    };
    
    const handleMicClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("متصفحك لا يدعم ميزة التعرف على الصوت.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const speechResult = event.results[0][0].transcript;
            const newIngredients = speechResult.split(/ و |,| and /)
                .map((s: string) => s.trim())
                .filter((s: string) => s && !ingredients.includes(s));
            
            if (newIngredients.length > 0) {
                 setIngredients(prev => [...prev, ...newIngredients]);
            }
        };

        recognition.start();
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ingredients.length === 0) {
            return;
        }
        onGenerateRecipe({ ingredients, dietaryRestrictions });
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSearchTerm('');
    };

    const handleClearIngredients = () => {
        setIngredients([]);
        setDietaryRestrictions([]);
        onClearAll();
    };

    const filteredCategories = Object.entries(INGREDIENT_CATEGORIES)
        .map(([category, items]) => {
            const filteredItems = items.filter(item =>
                item.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return [category, filteredItems] as [string, string[]];
        })
        .filter(([, items]) => items.length > 0);

    return (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg" dir="rtl">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="ingredient-input" className="block text-lg font-semibold text-gray-700 mb-2">
                        أضف المكونات المتوفرة لديك
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="ingredient-input"
                            type="text"
                            value={currentIngredient}
                            onChange={(e) => setCurrentIngredient(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddIngredient();
                                }
                            }}
                            placeholder="مثال: دجاج، أرز، طماطم..."
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                         <button
                            type="button"
                            onClick={handleMicClick}
                            className={`px-4 py-2 rounded-lg transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            aria-label="استخدام الميكروفون"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={handleAddIngredient}
                            className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition"
                        >
                            إضافة
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full px-6 py-2 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition"
                    >
                        تصفح قائمة المكونات
                    </button>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-xl font-semibold text-gray-800">اختر المكونات</h3>
                                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="إغلاق">&times;</button>
                            </div>
                            <div className="p-4 border-b">
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ابحث عن مكون..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    aria-label="ابحث عن مكون"
                                />
                            </div>
                            <div className="p-6 overflow-y-auto">
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(([category, items]) => (
                                        <div key={category} className="mb-6">
                                            <h4 className="text-lg font-bold text-emerald-700 mb-3 border-r-4 border-emerald-500 pr-2">{category}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map(item => (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => handleAddIngredientFromModal(item)}
                                                        disabled={ingredients.includes(item)}
                                                        className="px-3 py-1.5 text-sm font-medium rounded-full transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4">لم يتم العثور على نتائج.</p>
                                )}
                            </div>
                            <div className="p-4 border-t text-center bg-gray-50 rounded-b-lg">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-8 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                <div className="mb-6 min-h-[50px]">
                    {ingredients.length > 0 && (
                        <div className="flex justify-end mb-2">
                            <button
                                type="button"
                                onClick={handleClearIngredients}
                                className="px-3 py-1 text-sm text-red-600 font-semibold hover:bg-red-100 rounded-md transition-colors"
                                aria-label="مسح كل المكونات"
                            >
                                مسح الكل
                            </button>
                        </div>
                    )}
                    <ul className="flex flex-wrap gap-2">
                        {ingredients.map((ingredient, index) => (
                            <li
                                key={index}
                                className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
                            >
                                <span>{ingredient}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveIngredient(ingredient)}
                                    className="text-emerald-600 hover:text-emerald-800"
                                    aria-label={`إزالة ${ingredient}`}
                                >
                                    &times;
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                        القيود الغذائية (اختياري)
                    </label>
                    <div className="relative" ref={dietaryDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsDietaryDropdownOpen(prev => !prev)}
                            className="flex flex-wrap items-center gap-2 p-2 w-full bg-white border border-gray-300 rounded-lg min-h-[44px] text-right cursor-default focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            aria-haspopup="listbox"
                            aria-expanded={isDietaryDropdownOpen}
                        >
                            {dietaryRestrictions.length === 0 && <span className="text-gray-400">اختر القيود...</span>}
                            {dietaryRestrictions.map(restriction => (
                                <span key={restriction} className="flex items-center gap-2 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                                    <span>{restriction}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent dropdown from toggling
                                            const restrictionId = DIETARY_RESTRICTIONS.find(r => r.label === restriction)?.id;
                                            if (restrictionId) handleDietaryChange(restrictionId);
                                        }}
                                        className="text-emerald-600 hover:text-emerald-800"
                                        aria-label={`إزالة ${restriction}`}
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </button>
                        {isDietaryDropdownOpen && (
                            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto" role="listbox">
                                {DIETARY_RESTRICTIONS.map(restriction => (
                                    <li 
                                        key={restriction.id} 
                                        onClick={() => handleDietaryChange(restriction.id)} 
                                        className="px-4 py-2 hover:bg-emerald-50 cursor-pointer flex items-center justify-between" 
                                        role="option" 
                                        aria-selected={dietaryRestrictions.includes(restriction.label)}
                                    >
                                        <span className="text-gray-700">{restriction.label}</span>
                                        {dietaryRestrictions.includes(restriction.label) && <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        disabled={isLoading || ingredients.length === 0}
                        className="w-full sm:w-auto px-12 py-3 bg-emerald-600 text-white font-bold text-lg rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition disabled:bg-emerald-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'جاري تحضير الوصفة...' : 'اصنع لي وصفة!'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IngredientInput;