import React from 'react';
import { SparklesIcon } from '../constants';

interface ChatBubbleProps {
  role: 'user' | 'model';
  text: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text }) => {
  const isModel = role === 'model';

  return (
    <div className={`flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
      {isModel && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
          <SparklesIcon className="h-5 w-5 text-blue-400" />
        </div>
      )}
      <div
        className={`rounded-lg p-3 max-w-xs sm:max-w-sm whitespace-pre-wrap ${
          isModel ? 'bg-slate-800 text-slate-300' : 'bg-blue-600 text-white'
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export default ChatBubble;