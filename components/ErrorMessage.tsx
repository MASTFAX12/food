
import React from 'react';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <div className="mt-6 p-4 w-full bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
            <strong className="font-bold">خطأ! </strong>
            <span className="block sm:inline">{message}</span>
        </div>
    );
};

export default ErrorMessage;
