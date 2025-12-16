import React, { useState } from 'react';
import { MessageSquareDashed } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MarginaliaProps {
  note: { en: string; zh: string };
  trigger?: string;
}

export const Marginalia: React.FC<MarginaliaProps> = ({ note, trigger = "*" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { lang } = useLanguage();

  return (
    <span className="relative inline-block align-text-top leading-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`text-xs font-mono text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors cursor-pointer select-none px-0.5 ${isOpen ? 'text-stone-800 dark:text-stone-200 font-bold' : ''}`}
        aria-label="View research note"
        title="View marginalia"
      >
        [{trigger}]
      </button>

      {/* Popover */}
      <div 
        className={`
          absolute z-50 left-0 bottom-full mb-2 w-64 md:w-80 
          bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm p-4
          transform transition-all duration-300 origin-bottom-left
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}
        `}
      >
        <div className="flex items-start gap-3">
          <MessageSquareDashed size={16} className="text-stone-300 dark:text-stone-600 shrink-0 mt-1" />
          <div className="font-hand text-stone-600 dark:text-stone-300 text-lg leading-snug">
            {note[lang]}
          </div>
        </div>
        <div className="mt-2 text-[10px] text-stone-300 dark:text-stone-600 font-mono text-right uppercase tracking-widest">
            Unfinished Thought
        </div>
        {/* Triangle pointer */}
        <div className="absolute left-3 -bottom-[6px] w-3 h-3 bg-white dark:bg-stone-900 border-b border-r border-stone-200 dark:border-stone-700 transform rotate-45"></div>
      </div>
    </span>
  );
};