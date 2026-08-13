import React from 'react';

interface TermsModalProps {
    title: string;
    content: React.ReactNode;
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ title, content, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 sm:p-5 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 sm:p-6 overflow-y-auto prose prose-sm max-w-none text-gray-600 dark:text-gray-300 dark:prose-strong:text-gray-200 dark:[&_ul>li]:before:bg-gray-500">
                    {content}
                </div>
                <div className="p-4 border-t dark:border-gray-700 text-right bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                     <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;