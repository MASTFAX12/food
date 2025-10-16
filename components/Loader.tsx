import React from 'react';

const progressSteps = [
    "جاري تحليل المكونات...",
    "جاري ابتكار مجموعة من الوصفات...",
];

interface LoaderProps {
    step: number;
}

const Loader: React.FC<LoaderProps> = ({ step }) => {
    const totalSteps = progressSteps.length;
    // Ensure step doesn't go out of bounds
    const currentStep = Math.min(step, totalSteps - 1);
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg" aria-live="polite">
            <p className="text-center text-lg font-semibold text-gray-700 mb-4">{progressSteps[currentStep]}</p>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                    className="bg-emerald-500 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuetext={progressSteps[currentStep]}
                ></div>
            </div>
        </div>
    );
};

export default Loader;
