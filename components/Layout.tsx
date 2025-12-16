import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AUTHOR } from '../services/data';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Starfield } from './Starfield';
import { SmoothText } from './SmoothText';

const Layout: React.FC = () => {
  const location = useLocation();
  const { lang, toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isNightTime, setIsNightTime] = useState(false);
  const [showDeepThought, setShowDeepThought] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      // 22:00 to 04:00
      setIsNightTime(hour >= 22 || hour < 4);
    };
    checkTime();
    // Re-check every minute
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Easter Egg: "Still thinking" after 2 minutes in Night Mode
  useEffect(() => {
    let timer: number;
    if (theme === 'dark') {
      timer = window.setTimeout(() => {
        setShowDeepThought(true);
      }, 120000); // 2 minutes
    } else {
      setShowDeepThought(false);
    }
    return () => clearTimeout(timer);
  }, [theme]);

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'text-stone-900 dark:text-stone-200 font-medium' 
      : 'text-stone-500 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-400 transition-colors';
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-1000">
       
       {/* Global Noise Texture (Visible in Day Mode too for texture) */}
       <div className="fixed inset-0 pointer-events-none z-0 opacity-30 dark:opacity-20 bg-noise mix-blend-multiply dark:mix-blend-overlay"></div>

       {/* Ambient Background for Night Mode */}
       <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 z-0 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/50 via-ink-950/80 to-ink-950"></div>
          {/* Subtle glow/gradient */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-slate-800/20 blur-[120px]"></div>
          
          {/* Starfield - Only renders/visible in Night Mode */}
          <Starfield />
       </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-6 py-8 md:py-16 selection:bg-stone-200 selection:text-stone-900 dark:selection:bg-ink-800 dark:selection:text-stone-100">
        {/* Header / Nav */}
        <header className="flex flex-col md:flex-row md:items-start justify-between mb-16 md:mb-24 border-b border-stone-200/60 dark:border-ink-800 pb-6 transition-colors duration-1000">
            <div className="mb-6 md:mb-0 fade-in">
            <NavLink to="/" className="font-serif text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 block leading-none mb-2 transition-colors">
                <SmoothText stagger={0}>{AUTHOR.name[lang]}</SmoothText>
            </NavLink>
            <div className="text-sm text-stone-500 dark:text-stone-500 font-light tracking-wide transition-colors">
                <SmoothText stagger={50}>{AUTHOR.role[lang]}</SmoothText>
            </div>
            </div>

            <div className="flex flex-col items-end gap-6 fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
                {/* Language Toggle */}
                <button 
                    onClick={toggleLang} 
                    className="text-xs font-mono uppercase tracking-wider text-stone-400 hover:text-stone-800 dark:hover:text-stone-300 transition-colors"
                >
                    <span className={lang === 'en' ? 'text-stone-800 dark:text-stone-200 font-bold' : ''}>EN</span>
                    <span className="mx-1">/</span>
                    <span className={lang === 'zh' ? 'text-stone-800 dark:text-stone-200 font-bold' : ''}>中</span>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="text-stone-400 hover:text-stone-800 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                    aria-label="Toggle Reading/Thinking Mode"
                >
                    {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
                </button>
            </div>

            <nav className="flex space-x-8 text-sm tracking-wide font-medium">
                <NavLink to="/" className={isActive('/')}><SmoothText stagger={0}>{t('nav.map')}</SmoothText></NavLink>
                <NavLink to="/topics" className={isActive('/topics')}><SmoothText stagger={50}>{t('nav.themes')}</SmoothText></NavLink>
                <NavLink to="/projects" className={isActive('/projects')}><SmoothText stagger={100}>{t('nav.artifacts')}</SmoothText></NavLink>
                <NavLink to="/about" className={isActive('/about')}><SmoothText stagger={150}>{t('nav.about')}</SmoothText></NavLink>
            </nav>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow w-full min-h-[50vh]">
            <Outlet />
        </main>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-stone-200/60 dark:border-ink-800 text-stone-400 dark:text-stone-600 text-xs flex justify-between font-mono relative transition-colors duration-1000">
            <div>&copy; {new Date().getFullYear()} <SmoothText>{AUTHOR.name[lang]}</SmoothText></div>
            
            {/* Easter Egg #2: Night Thinker - Shows based on real time or explicitly in Night Mode */}
            {(isNightTime || theme === 'dark') && (
            <div className="absolute left-1/2 -translate-x-1/2 top-12 flex items-center gap-2 text-stone-300 dark:text-stone-700 animate-breath">
                <Moon size={10} />
                <span>Most ideas arrive at night.</span>
            </div>
            )}
            
            {/* Deep Thought Easter Egg (Post 2-min delay in Night Mode) */}
            <div className={`fixed bottom-8 right-8 text-[10px] font-mono text-stone-300/40 dark:text-stone-600/60 uppercase tracking-widest transition-opacity duration-2000 pointer-events-none ${showDeepThought ? 'opacity-100' : 'opacity-0'}`}>
                <SmoothText>{lang === 'en' ? 'Still thinking.' : '未完待续.'}</SmoothText>
            </div>

            <div className="space-x-4">
            <span><SmoothText stagger={200}>{t('footer.rights')}</SmoothText></span>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;