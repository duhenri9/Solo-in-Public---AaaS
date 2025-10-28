import React, { useState } from 'react';
import { LightbulbIcon } from '../constants';
import FeedbackModal from './FeedbackModal';

const FeedbackWidget: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-4 left-4 sm:left-8 bg-slate-700 text-white rounded-full p-4 shadow-2xl shadow-purple-600/20 z-50 transition-transform hover:scale-110 active:scale-95"
                aria-label="Enviar feedback"
            >
                <LightbulbIcon className="h-8 w-8 text-purple-300" />
            </button>
            <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default FeedbackWidget;