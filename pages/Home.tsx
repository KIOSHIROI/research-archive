
import React, { useState } from 'react';
import { useThemes, useAllContent, useAuthor } from '../contexts/ContentContext';
import { ContentType } from '../types';
import { Link } from 'react-router-dom';
import { ArrowRight, Network, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { FadeIn } from '../components/FadeIn';
import { Marginalia } from '../components/Marginalia';
import { SmoothText, SmoothBlock } from '../components/SmoothText';

const Home: React.FC = () => {
  const content = useAllContent();
  const themes = useThemes();
  const author = useAuthor();
  const selectedWorks = content.slice(0, 3);
  const { lang, t } = useLanguage();
  
  // Easter Egg #3 Logic
  const [clickedThemes, setClickedThemes] = useState<Set<string>>(new Set());
  const [unlockedSpeculative, setUnlockedSpeculative] = useState(false);

  const handleThemeClick = (id: string) => {
    const newSet = new Set(clickedThemes);
    newSet.add(id);
    setClickedThemes(newSet);
    
    if (newSet.size >= 3) {
      setUnlockedSpeculative(true);
    }
  };

  const bioNote = {
    en: "We are currently hitting the memory wall. The bottleneck is not compute, but data movement.",
    zh: "我们正在撞击内存墙。瓶颈不在于计算，而在于数据搬运。"
  };

  const coreIntuition = {
    en: "True intelligence is not caged; it reshapes the world, making the sun and moon renew the sky.",
    zh: "真正的智能，不在樊笼中，而应重塑世界，叫日月换新天。"
  };

  return (
    <div className="space-y-32 pb-12">
      
      {/* 1. Research Overview / Statement */}
      <FadeIn>
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
            <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-stone-300 dark:bg-stone-700 rounded-full animate-pulse"></span>
                <SmoothText stagger={0}>{t('home.focus')}</SmoothText>
            </h2>
            <div className="w-12 h-1 bg-stone-800 dark:bg-stone-200 mb-6"></div>
            </div>
            <div className="md:col-span-8">
            <div className="prose-academic text-stone-800 dark:text-stone-300 text-lg md:text-xl font-serif leading-loose transition-colors">
                <SmoothBlock stagger={100} className="relative">
                    {author.bio[lang]}
                    <Marginalia note={bioNote} trigger="?" />
                </SmoothBlock>
                <div className="mt-8 text-stone-600 dark:text-stone-400 italic text-base animate-clarity opacity-60 blur-[0.3px]">
                   <SmoothText stagger={200}>"{coreIntuition[lang]}"</SmoothText>
                </div>
            </div>
            </div>
        </section>
      </FadeIn>

      {/* 2. Research Landscape (Grid of Cards with Images) */}
      <section className="relative">
        <FadeIn>
            <div className="flex items-baseline justify-between mb-8 border-b border-stone-200 dark:border-stone-800 pb-2 transition-colors">
                <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase">
                  <SmoothText stagger={50}>{t('home.themes')}</SmoothText>
                </h2>
            </div>
        </FadeIn>
        
        <div className="md:-mx-8 md:px-8 md:py-8 rounded-2xl bg-stone-50/80 dark:bg-transparent transition-colors duration-1000">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {themes.map((theme, index) => (
                <FadeIn key={theme.id} delay={index * 150} className="h-full">
                    <div 
                        className="group flex flex-col h-full cursor-pointer bg-white/40 dark:bg-transparent p-4 md:p-0 rounded-sm md:rounded-none transition-colors duration-500"
                        onClick={() => handleThemeClick(theme.id)}
                    >
                    <div className="mb-6 overflow-hidden bg-stone-100 dark:bg-stone-900 aspect-[4/3] border border-stone-100 dark:border-stone-800 relative transition-colors duration-500">
                        {theme.coverImage ? (
                            <div className="w-full h-full overflow-hidden">
                                <img 
                                    src={theme.coverImage} 
                                    alt="Abstract visualization" 
                                    className="w-full h-full object-cover filter grayscale opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1500ms] ease-out mix-blend-multiply dark:mix-blend-normal dark:opacity-60 dark:group-hover:opacity-90"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-700">
                                <Network strokeWidth={1} size={48} />
                            </div>
                        )}
                        <div className="absolute top-2 right-2 text-[10px] font-mono text-stone-500 dark:text-stone-400 bg-white/90 dark:bg-stone-900/90 px-2 py-0.5 backdrop-blur-sm border border-stone-100 dark:border-stone-800 group-hover:border-stone-300 dark:group-hover:border-stone-600 transition-colors">
                            0{index + 1}
                        </div>
                    </div>

                    <div className="flex-grow px-2 md:px-0">
                        <Link to={`/topics#${theme.id}`} className="block">
                        <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors mb-3">
                            <SmoothText stagger={100 + (index * 50)}>{theme.title[lang]}</SmoothText>
                        </h3>
                        </Link>
                        <p className="text-xs text-stone-500 dark:text-stone-500 font-mono mb-3 leading-relaxed border-l-2 border-stone-200 dark:border-stone-800 pl-3 group-hover:border-stone-400 dark:group-hover:border-stone-600 transition-colors">
                            <SmoothText stagger={150 + (index * 50)}>{theme.hypothesis[lang]}</SmoothText>
                        </p>
                        <div className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                            <SmoothText stagger={200 + (index * 50)}>{theme.description[lang]}</SmoothText>
                        </div>
                    </div>
                    </div>
                </FadeIn>
            ))}
            </div>
        </div>
      </section>

      {/* 3. Selected Inquiries */}
      <section>
        <FadeIn>
            <div className="flex items-center justify-between mb-8 border-b border-stone-200 dark:border-stone-800 pb-2 transition-colors">
            <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase">
                <SmoothText stagger={100}>{t('home.selected')}</SmoothText>
            </h2>
            <Link to="/topics" className="text-xs text-stone-500 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 flex items-center gap-1 transition-colors font-mono group">
                <SmoothText stagger={150}>{t('home.full_index')}</SmoothText>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 gap-0">
            {selectedWorks.map((item, idx) => (
                <FadeIn key={item.id} delay={idx * 100}>
                    <Link 
                        to={item.type === ContentType.PROJECT ? `/projects/${item.slug}` : `/articles/${item.slug}`}
                        className="group py-6 border-b border-stone-100 dark:border-stone-900 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors px-2 -mx-2 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline relative overflow-hidden"
                    >
                        <div className="md:col-span-2 text-xs font-mono text-stone-400 dark:text-stone-600 group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors">
                            {item.date}
                        </div>
                        <div className="md:col-span-8">
                            <h4 className="font-medium text-stone-800 dark:text-stone-200 font-serif text-lg group-hover:text-black dark:group-hover:text-white transition-colors">
                                <SmoothText stagger={200 + (idx * 50)}>{item.title[lang]}</SmoothText>
                            </h4>
                            <div className="text-sm text-stone-500 dark:text-stone-400 mt-2 line-clamp-2 max-w-3xl">
                                <SmoothText stagger={250 + (idx * 50)}>{item.abstract[lang]}</SmoothText>
                            </div>
                        </div>
                        <div className="md:col-span-2 text-right">
                            <span className="inline-block text-[10px] uppercase tracking-wider border border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-600 px-2 py-1 rounded-sm group-hover:border-stone-400 dark:group-hover:border-stone-500 transition-colors bg-white dark:bg-stone-900 group-hover:bg-transparent">
                                <SmoothText>{item.type === ContentType.PROJECT ? t('label.artifact') : t('label.article')}</SmoothText>
                            </span>
                        </div>
                    </Link>
                </FadeIn>
            ))}
        </div>
      </section>

      {/* Easter Egg #3: Unlockable Link */}
      {unlockedSpeculative && (
        <FadeIn>
           <div className="flex justify-center mt-16">
              <Link to="/speculative" className="flex items-center gap-2 text-stone-300 dark:text-stone-700 hover:text-stone-500 dark:hover:text-stone-500 transition-colors text-xs font-mono uppercase tracking-widest group">
                 <Sparkles size={14} className="group-hover:animate-spin" />
                 <span><SmoothText>Speculative Notes</SmoothText></span>
              </Link>
           </div>
        </FadeIn>
      )}

    </div>
  );
};

export default Home;
