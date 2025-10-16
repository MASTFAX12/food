import React from 'react';

interface ApiKeySelectorProps {
    onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
    
    const handleSelectKey = async () => {
        try {
            await window.aistudio.openSelectKey();
            // افتراض النجاح وإعلام المكون الأصل لإعادة العرض
            onKeySelected();
        } catch (error) {
            console.error("Error opening API key selection dialog:", error);
            // اختياري: عرض خطأ للمستخدم هنا
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg text-center" dir="rtl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">مطلوب مفتاح API</h2>
            <p className="text-gray-600 mb-6">
                يعتمد هذا التطبيق على واجهة برمجة تطبيقات Gemini. للمتابعة، يرجى تحديد مفتاح API الخاص بك. قد يتم تطبيق رسوم بناءً على استخدامك.
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline mr-1">
                    اعرف المزيد عن التسعير
                </a>.
            </p>
            <button
                onClick={handleSelectKey}
                className="px-8 py-3 bg-emerald-600 text-white font-bold text-lg rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition"
            >
                تحديد مفتاح API
            </button>
        </div>
    );
};

export default ApiKeySelector;
