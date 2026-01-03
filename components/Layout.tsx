import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthor } from '../contexts/ContentContext';
import { Moon, Sun, Search } from 'lucide-react';
import { Starfield } from './Starfield';
import { SmoothText } from './SmoothText';
import { CommandPalette } from './CommandPalette';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const author = useAuthor();
  const [isNightTime, setIsNightTime] = useState(false);
  const [showDeepThought, setShowDeepThought] = useState(false);
  
  // Admin Trigger Logic
  const titlePressTimer = useRef<number | null>(null);

  useEffect(() => {
    // 1. Time Check
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsNightTime(hour >= 22 || hour < 4);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);

    // 2. Keyboard Listener (Cmd+Shift+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/admin');
      }
      // Trigger search with just / key if not in an input
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  useEffect(() => {
    let timer: number;
    if (theme === 'dark') {
      timer = window.setTimeout(() => {
        setShowDeepThought(true);
      }, 120000); 
    } else {
      setShowDeepThought(false);
    }
    return () => clearTimeout(timer);
  }, [theme]);

  const handleTitleMouseDown = () => {
    titlePressTimer.current = window.setTimeout(() => {
      navigate('/admin');
    }, 3000); // 3 seconds long press
  };

  const handleTitleMouseUp = () => {
    if (titlePressTimer.current) {
      clearTimeout(titlePressTimer.current);
      titlePressTimer.current = null;
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'text-stone-900 dark:text-stone-200 font-medium' 
      : 'text-stone-500 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-400 transition-colors';
  };

  // Check if we are in Admin mode
  const isAdmin = location.pathname === '/admin';

  return (
    <div className={`flex flex-col relative transition-colors duration-1000 ${isAdmin ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
       
       <CommandPalette />

       {/* Global Noise Texture */}
       <div className="fixed inset-0 pointer-events-none z-0 opacity-30 dark:opacity-20 bg-noise mix-blend-multiply dark:mix-blend-overlay"></div>

       {/* Ambient Background */}
       <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 z-0 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/50 via-ink-950/80 to-ink-950"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-slate-800/20 blur-[120px]"></div>
          <Starfield />
       </div>

      <div className={`relative z-10 mx-auto w-full transition-all duration-300 ${isAdmin ? 'h-full p-0 max-w-none' : 'px-6 py-8 md:py-16 max-w-5xl selection:bg-stone-200 selection:text-stone-900 dark:selection:bg-ink-800 dark:selection:text-stone-100'}`}>
        
        {/* Header (Hidden in Admin) */}
        {!isAdmin && (
            <header className="flex flex-col md:flex-row md:items-start justify-between mb-16 md:mb-24 border-b border-stone-200/60 dark:border-ink-800 pb-6 transition-colors duration-1000">
                <div className="mb-6 md:mb-0 fade-in">
                <div 
                    onMouseDown={handleTitleMouseDown}
                    onMouseUp={handleTitleMouseUp}
                    onTouchStart={handleTitleMouseDown}
                    onTouchEnd={handleTitleMouseUp}
                    className="cursor-pointer select-none"
                >
                    <NavLink to="/" className="font-serif text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 block leading-none mb-2 transition-colors">
                        <SmoothText stagger={0}>{author.name[lang]}</SmoothText>
                    </NavLink>
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-500 font-light tracking-wide transition-colors">
                    <SmoothText stagger={50}>{author.role[lang]}</SmoothText>
                </div>
                </div>

                <div className="flex flex-col items-end gap-6 fade-in" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                        className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-400 hover:text-stone-800 dark:hover:text-stone-300 transition-colors group"
                    >
                        <Search size={14} />
                        <span className="hidden md:inline group-hover:border-b border-stone-300 dark:border-stone-700">CMD+K</span>
                    </button>
                    
                    <span className="text-stone-300 dark:text-stone-700">|</span>

                    <button 
                        onClick={toggleLang} 
                        className="text-xs font-mono uppercase tracking-wider text-stone-400 hover:text-stone-800 dark:hover:text-stone-300 transition-colors"
                    >
                        <span className={lang === 'en' ? 'text-stone-800 dark:text-stone-200 font-bold' : ''}>EN</span>
                        <span className="mx-1">/</span>
                        <span className={lang === 'zh' ? 'text-stone-800 dark:text-stone-200 font-bold' : ''}>中</span>
                    </button>

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
        )}

        {/* Main Content with Fade Transition */}
        {isAdmin ? (
             <Outlet />
        ) : (
            <main className="flex-grow w-full min-h-[50vh]">
                <div key={location.pathname} className="animate-fade-in-up">
                <Outlet />
                </div>
            </main>
        )}

        {/* Footer (Hidden in Admin) */}
        {!isAdmin && (
            <footer className="mt-32 pt-12 border-t border-stone-200/60 dark:border-ink-800 text-stone-400 dark:text-stone-600 text-xs flex justify-between font-mono relative transition-colors duration-1000">
                <div>&copy; {new Date().getFullYear()} <SmoothText>{author.name[lang]}</SmoothText></div>
                
                {(isNightTime || theme === 'dark') && (
                <div className="absolute left-1/2 -translate-x-1/2 top-12 flex items-center gap-2 text-stone-300 dark:text-stone-700 animate-breath">
                    <Moon size={10} />
                    <span>Most ideas arrive at night.</span>
                </div>
                )}
                
                <div className={`fixed bottom-8 right-8 text-[10px] font-mono text-stone-300/40 dark:text-stone-600/60 uppercase tracking-widest transition-opacity duration-2000 pointer-events-none ${showDeepThought ? 'opacity-100' : 'opacity-0'}`}>
                    <SmoothText>{lang === 'en' ? 'Still thinking.' : '未完待续.'}</SmoothText>
                </div>

                <div className="space-x-4">
                <span><SmoothText stagger={200}>{t('footer.rights')}</SmoothText></span>
                </div>
            </footer>
        )}
      </div>
    </div>
  );
};

export default Layout;