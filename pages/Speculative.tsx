import React from 'react';
import { SPECULATIVE_CONTENT } from '../services/data';
import { useLanguage } from '../contexts/LanguageContext';
import { FadeIn } from '../components/FadeIn';
import { Sparkles } from 'lucide-react';

const Speculative: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-16">
      <FadeIn>
        <header className="mb-12 flex items-center gap-3">
          <Sparkles className="text-stone-400 dark:text-stone-500" size={20} />
          <h1 className="font-serif text-2xl md:text-3xl text-stone-800 dark:text-stone-200 italic transition-colors">
            {SPECULATIVE_CONTENT.title[lang]}
          </h1>
        </header>

        <div className="prose-academic text-stone-700 dark:text-stone-300 text-lg leading-loose font-serif transition-colors">
           <p className="text-stone-500 dark:text-stone-400 italic border-l-2 border-stone-200 dark:border-stone-700 pl-4 mb-12">
             {lang === 'en' 
               ? "Hypotheses that are yet too fragile for papers. Intuitions, doubts, and science fiction."
               : "尚不足以写成论文的假设。直觉、怀疑与科幻想象。"
             }
           </p>

           <div className="space-y-16">
              {SPECULATIVE_CONTENT.items.map((item, idx) => (
                <div key={idx} className="relative">
                   <div className="absolute -left-12 top-1 text-xs font-mono text-stone-300 dark:text-stone-600 hidden md:block">
                     {item.date}
                   </div>
                   <p>{item.text[lang]}</p>
                   <div className="w-8 h-px bg-stone-200 dark:bg-stone-800 mt-8"></div>
                </div>
              ))}
           </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default Speculative;