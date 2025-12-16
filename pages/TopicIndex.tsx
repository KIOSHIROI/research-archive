import React from 'react';
import { getThemes, getContentByTheme } from '../services/data';
import { ContentCard } from '../components/ContentCard';
import { useLanguage } from '../contexts/LanguageContext';
import { FadeIn } from '../components/FadeIn';
import { SmoothText, SmoothBlock } from '../components/SmoothText';

const TopicIndex: React.FC = () => {
  const themes = getThemes();
  const { lang, t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        case 'Exploring': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
        case 'Stabilizing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        default: return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-400';
    }
  }

  return (
    <div className="space-y-32">
      <FadeIn>
        <div className="max-w-3xl">
            <h1 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-stone-100 mb-6 transition-colors">
                <SmoothText stagger={0}>{t('nav.themes')}</SmoothText>
            </h1>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-serif text-lg transition-colors">
                <SmoothText stagger={100}>
                    {lang === 'en' 
                        ? "An index of active research threads. Organized by problem space, hypothesis, and methodological approach."
                        : "活跃研究线索索引。按问题域、假设和方法论组织。"
                    }
                </SmoothText>
            </p>
        </div>
      </FadeIn>

      <div className="space-y-32 relative border-l border-stone-200 dark:border-ink-800 ml-4 md:ml-0 transition-colors">
        {themes.map((theme, index) => {
          const content = getContentByTheme(theme.id);
          
          return (
            <section key={theme.id} id={theme.id} className="scroll-mt-32 relative pl-8 md:pl-12">
               {/* Timeline Node */}
               <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-stone-300 dark:bg-ink-700 rounded-full border-2 border-stone-50 dark:border-ink-950 transition-colors hover:bg-stone-500 dark:hover:bg-slate-500 duration-500"></div>

               <FadeIn delay={index * 100}>
                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                            <span className="font-mono text-xs text-stone-400 dark:text-stone-600">0{index + 1}</span>
                            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                                <SmoothText stagger={100 + (index * 50)}>{theme.title[lang]}</SmoothText>
                            </h2>
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border font-mono ${getStatusColor(theme.status)}`}>
                                {theme.status}
                            </span>
                        </div>
                        
                        <div className="bg-stone-100/50 dark:bg-ink-900/50 p-6 border-l-4 border-stone-300 dark:border-ink-700 max-w-2xl hover:border-stone-400 dark:hover:border-slate-600 transition-colors duration-500">
                            <span className="text-xs font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase block mb-2">
                                <SmoothText stagger={150}>{t('theme.hypothesis')}</SmoothText>
                            </span>
                            <p className="text-stone-700 dark:text-stone-300 font-serif italic text-lg leading-relaxed">
                                <SmoothText stagger={200 + (index * 50)}>"{theme.hypothesis[lang]}"</SmoothText>
                            </p>
                        </div>
                        <div className="text-stone-500 dark:text-stone-400 text-sm mt-4 max-w-xl leading-relaxed">
                            <SmoothText stagger={250 + (index * 50)}>{theme.description[lang]}</SmoothText>
                        </div>
                    </div>
               </FadeIn>
               
               {/* Content List */}
               <div className="space-y-8">
                 {content.length > 0 ? content.map((item, cIndex) => (
                   <FadeIn key={item.id} delay={cIndex * 100 + 200}>
                        <ContentCard item={item} />
                   </FadeIn>
                 )) : (
                    <FadeIn delay={200}>
                        <div className="text-stone-400 dark:text-stone-600 text-sm italic pl-6">
                            <SmoothText>
                                {lang === 'en' ? "Research in early conceptualization phase." : "研究处于早期概念化阶段。"}
                            </SmoothText>
                        </div>
                    </FadeIn>
                 )}
               </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default TopicIndex;