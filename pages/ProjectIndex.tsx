
import React from 'react';
import { useAllContent } from '../contexts/ContentContext';
import { ContentType } from '../types';
import { ContentCard } from '../components/ContentCard';
import { Archive } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ProjectIndex: React.FC = () => {
  const allContent = useAllContent();
  const projects = allContent.filter(c => c.type === ContentType.PROJECT);
  const { lang, t } = useLanguage();

  return (
    <div>
      <div className="max-w-2xl mb-16">
        <div className="flex items-center gap-3 mb-4 text-stone-400 dark:text-stone-500">
            <Archive size={20} />
            <span className="text-xs font-bold tracking-widest uppercase">{t('nav.artifacts')}</span>
        </div>
        <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100 mb-6 transition-colors">{lang === 'en' ? 'Code & Reproducibility' : '代码与复现'}</h1>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-serif text-lg transition-colors">
            {lang === 'en' 
             ? "Selected implementations, datasets, and tooling developed to support research claims. Prioritizing reproducibility and minimal dependencies."
             : "为支持研究结论而开发的精选实现、数据集和工具。优先考虑可复现性和最小依赖。"
            }
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {projects.map(project => (
          <ContentCard key={project.id} item={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectIndex;
