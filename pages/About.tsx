import React, { useState } from 'react';
import { AUTHOR } from '../services/data';
import { useLanguage } from '../contexts/LanguageContext';
import { FadeIn } from '../components/FadeIn';
import { SmoothText, SmoothBlock } from '../components/SmoothText';

const About: React.FC = () => {
  const { lang, t } = useLanguage();
  const [showExploration, setShowExploration] = useState(false);

  return (
    <FadeIn>
        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Sidebar / Profile Image Area */}
        <div className="md:col-span-4">
            <div className="bg-stone-200 dark:bg-stone-800 aspect-[3/4] mb-6 grayscale mix-blend-multiply dark:mix-blend-normal relative overflow-hidden group transition-colors duration-500">
                {/* Placeholder for Researcher Portrait */}
                <img 
                    src="https://placehold.co/400x533/d6d3d1/57534e?text=kioshiro" 
                    alt="Portrait" 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-[2s] ease-out dark:opacity-80"
                />
            </div>
            <div className="font-mono text-xs text-stone-500 dark:text-stone-500 space-y-1">
                <p><SmoothText stagger={0}>{AUTHOR.role[lang]}</SmoothText></p>
                <p><SmoothText stagger={50}>{AUTHOR.affiliation[lang]}</SmoothText></p>
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
              {/* Using SmoothBlock to transition the entire narrative block smoothly */}
              <SmoothBlock stagger={150}>
                {lang === 'en' ? (
                    <>
                        <p>
                            I am <strong>Bai Xinyu</strong> (writing as <em>Yu Qiubai</em>), <em>currently exploring</em> the systematic boundaries of Artificial Intelligence as a researcher.
                        </p>
                        <p>
                            Unlike the race for higher benchmarks, I am interested in the <strong>metabolism of intelligence</strong>—how models consume energy, how they perceive structure, and how they exist within our social fabric. I treat AI engineering not just as software development, but as the construction of a new species of infrastructure.
                        </p>
                        <p>
                            My work is heavily problem-driven. I build tools to dissect models, attempting to find the minimal viable structure for generalized reasoning.
                        </p>
                    </>
                ) : (
                    <>
                        <p>
                            我是<strong>白欣宇</strong>（笔名：<em>余秋白</em>），一名<em>正在</em>探索人工智能系统边界的研究者。
                        </p>
                        <p>
                            与其追逐更高的基准测试分数，我更感兴趣的是<strong>智能的新陈代谢</strong>——模型如何消耗能量，如何感知结构，以及它们如何存在于我们的社会肌理之中。我不止将 AI 工程视为软件开发，更将其视为一种新基础设施物种的构建。
                        </p>
                        <p>
                            我的工作具有强烈的问题驱动性。我构建工具来解剖模型，试图寻找通用推理所需的最小可行结构。
                        </p>
                    </>
                )}
              </SmoothBlock>
            </div>

            {/* Academic Context / Education - Simplified & Cold */}
            <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
                 <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-6">
                    <SmoothText stagger={200}>{lang === 'en' ? 'Academic Context' : '学术背景'}</SmoothText>
                 </h2>
                 <ul className="space-y-6">
                    {AUTHOR.education.map((edu, idx) => (
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
                    <a href={`mailto:${AUTHOR.email}`} className="text-stone-800 dark:text-stone-300 hover:underline decoration-stone-300 underline-offset-4 dark:hover:text-stone-100 transition-colors">{AUTHOR.email}</a>
                </li>
                <li className="grid grid-cols-[100px_1fr]">
                    <span className="text-stone-400 dark:text-stone-600">Github</span>
                    <a href={`https://${AUTHOR.github}`} className="text-stone-800 dark:text-stone-300 hover:underline decoration-stone-300 underline-offset-4 dark:hover:text-stone-100 transition-colors">{AUTHOR.github}</a>
                </li>
                </ul>
            </div>
        </div>
        </div>
    </FadeIn>
  );
};

export default About;