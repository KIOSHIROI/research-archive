
import React, { useState } from 'react';
import { useAuthor } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FadeIn } from '../components/FadeIn';
import { SmoothText, SmoothBlock } from '../components/SmoothText';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { Download } from 'lucide-react';

const About: React.FC = () => {
  const { lang, t } = useLanguage();
  const author = useAuthor();
  const [showExploration, setShowExploration] = useState(false);

  return (
    <FadeIn>
        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Sidebar / Profile Image Area */}
        <div className="md:col-span-4">
            <div className="bg-stone-200 dark:bg-stone-800 aspect-[3/4] mb-6 grayscale mix-blend-multiply dark:mix-blend-normal relative overflow-hidden group transition-colors duration-500">
                <img 
                    src={author.avatar || "https://placehold.co/400x533/d6d3d1/57534e?text=No+Image"} 
                    alt="Portrait" 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-[2s] ease-out dark:opacity-80"
                />
            </div>
            
            {/* Resume Download Button */}
            {author.resumeUrl && (
                <div className="mb-6">
                    <a 
                        href={author.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors border border-stone-200 dark:border-stone-700 px-4 py-3 rounded-sm hover:border-stone-400 dark:hover:border-stone-500 group"
                    >
                        <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                        <span>{lang === 'en' ? 'Download Resume' : '下载简历'}</span>
                    </a>
                </div>
            )}

            <div className="font-mono text-xs text-stone-500 dark:text-stone-500 space-y-1">
                <p><SmoothText stagger={0}>{author.role[lang]}</SmoothText></p>
                <p><SmoothText stagger={50}>{author.affiliation[lang]}</SmoothText></p>
            </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-8">
            <div className="flex items-baseline gap-2 mb-8">
                <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100 transition-colors">
                    <SmoothText stagger={0}>{t('nav.about')}</SmoothText>
                </h1>
                {/* Easter Egg #1: Exploration Phase Trigger */}
                <button 
                  onClick={() => setShowExploration(!showExploration)}
                  className="text-stone-300 hover:text-stone-500 dark:text-stone-700 dark:hover:text-stone-500 cursor-pointer select-none text-xl leading-none transition-colors"
                  aria-label="Toggle Note"
                >
                  ·
                </button>
            </div>

            {/* Hidden Content */}
            <div className={`
                mb-8 border-l-2 border-stone-300 dark:border-stone-700 pl-4 py-2 bg-stone-50/50 dark:bg-stone-900/50
                transition-all duration-700 ease-in-out overflow-hidden
                ${showExploration ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'}
            `}>
                <p className="font-mono text-xs text-stone-500 dark:text-stone-400 leading-relaxed uppercase tracking-wide">
                    <SmoothText>{lang === 'en' ? "Phase: Exploration" : "当前阶段：探索期"}</SmoothText>
                </p>
                <p className="font-serif text-sm text-stone-700 dark:text-stone-300 italic mt-2">
                    <SmoothText>
                    {lang === 'en' 
                        ? "This research log is intentionally incomplete. Some directions may fail. That is part of the process."
                        : "这份研究日志是有意保持不完整的。某些方向可能会失败。这正是过程的一部分。"
                    }
                    </SmoothText>
                </p>
            </div>
            
            {/* Bio */}
            <div className="prose-academic text-stone-700 dark:text-stone-300 text-lg leading-relaxed space-y-6 transition-colors">
              <SmoothBlock stagger={150}>
                  {/* We treat bio as markdown now to allow flexibility */}
                  <MarkdownRenderer content={author.bio[lang]} />
              </SmoothBlock>
            </div>

            {/* Academic Context / Education */}
            <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
                 <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-6">
                    <SmoothText stagger={200}>{lang === 'en' ? 'Academic Context' : '学术背景'}</SmoothText>
                 </h2>
                 <ul className="space-y-6">
                    {author.education.map((edu, idx) => (
                        <li key={idx} className="group flex flex-col items-start gap-1">
                             <div className="font-serif text-stone-800 dark:text-stone-300 text-base leading-snug group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-colors">
                                <SmoothText stagger={200 + (idx * 50)}>{edu.school[lang]}</SmoothText>
                             </div>
                             <div className="font-serif text-stone-500 dark:text-stone-500 text-sm">
                                <SmoothText stagger={250 + (idx * 50)}>{edu.department[lang]}</SmoothText>
                             </div>
                             <div className="mt-1 font-mono text-[11px] text-stone-400 dark:text-stone-600 uppercase tracking-wide">
                                <SmoothText stagger={300 + (idx * 50)}>
                                    <span>{edu.major[lang]}</span>
                                    <span className="mx-2 text-stone-300 dark:text-stone-700">/</span>
                                    <span>{edu.stage[lang]}</span>
                                </SmoothText>
                             </div>
                        </li>
                    ))}
                 </ul>
            </div>

            {/* Contact */}
            <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
                <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-6">
                    <SmoothText stagger={200}>{t('about.contact')}</SmoothText>
                </h2>
                <ul className="space-y-4 text-sm font-mono">
                <li className="grid grid-cols-[100px_1fr]">
                    <span className="text-stone-400 dark:text-stone-600">Email</span>
                    <a href={`mailto:${author.email}`} className="text-stone-800 dark:text-stone-300 hover:underline decoration-stone-300 underline-offset-4 dark:hover:text-stone-100 transition-colors">{author.email}</a>
                </li>
                <li className="grid grid-cols-[100px_1fr]">
                    <span className="text-stone-400 dark:text-stone-600">Github</span>
                    <a href={`https://${author.github}`} className="text-stone-800 dark:text-stone-300 hover:underline decoration-stone-300 underline-offset-4 dark:hover:text-stone-100 transition-colors">{author.github}</a>
                </li>
                </ul>
            </div>

            {/* Activity Heatmap - Moved to Bottom */}
            <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
                <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-6">
                    <SmoothText stagger={200}>{lang === 'en' ? 'Research Velocity' : '研究活跃度'}</SmoothText>
                </h2>
                <ActivityHeatmap />
            </div>

        </div>
        </div>
    </FadeIn>
  );
};

export default About;
