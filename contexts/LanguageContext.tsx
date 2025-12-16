import React, { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'zh';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const UI_TRANSLATIONS: Record<string, { en: string; zh: string }> = {
  'nav.map': { en: 'Research Map', zh: '研究版图' },
  'nav.themes': { en: 'Threads', zh: '研究线索' },
  'nav.artifacts': { en: 'Artifacts', zh: '工程产物' },
  'nav.about': { en: 'About', zh: '关于' },
  'footer.rights': { en: 'All rights reserved.', zh: '保留所有权利。' },
  'home.focus': { en: 'Focus & Scope', zh: '研究领域与范畴' },
  'home.themes': { en: 'Research Landscape', zh: '研究全景' },
  'home.selected': { en: 'Selected Inquiries', zh: '代表性工作' },
  'home.full_index': { en: 'Full Index', zh: '完整索引' },
  'theme.hypothesis': { en: 'Core Hypothesis', zh: '核心假设' },
  'meta.journal': { en: 'Publication', zh: '发表于' },
  'meta.code': { en: 'Codebase', zh: '代码库' },
  'about.contact': { en: 'Contact & Context', zh: '联系方式' },
  'back.topics': { en: 'Back to Threads', zh: '返回研究线索' },
  'back.artifacts': { en: 'Back to Artifacts', zh: '返回工程产物' },
  'label.article': { en: 'Article', zh: '论文' },
  'label.artifact': { en: 'Artifact', zh: '工程' },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>('en');

  const toggleLang = () => {
    setLang(prev => (prev === 'en' ? 'zh' : 'en'));
  };

  const t = (key: string) => {
    return UI_TRANSLATIONS[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};