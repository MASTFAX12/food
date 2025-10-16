import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center p-4 sm:p-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-600">مولد الوصفات بالذكاء الاصطناعي</h1>
            <p className="text-lg text-gray-500 mt-2">حوّل مكوناتك إلى وجبات شهية!</p>
        </header>
    );
};

export default Header;
