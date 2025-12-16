
import React, { useState } from 'react';
import { FadeIn } from '../components/FadeIn';
import { SmoothText } from '../components/SmoothText';
import { ContentType, Draft } from '../types';
import { THEMES } from '../services/data';
import { commitResearch } from '../services/publisher';
import { Terminal, Lock, FileText, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Admin: React.FC = () => {
  const { lang } = useLanguage();
  const [accessKey, setAccessKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusLog, setStatusLog] = useState<string[]>([]);

  // Form State
  const [draft, setDraft] = useState<Draft>({
    slug: '',
    titleZh: '',
    titleEn: '',
    type: ContentType.ARTICLE,
    themeId: THEMES[0].id,
    abstractZh: '',
    abstractEn: '',
    contentZh: '',
    contentEn: '',
    isDraft: true,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple client-side gate. Real security happens at the API endpoint.
    if (accessKey.length > 0) {
      setIsAuthenticated(true);
    }
  };

  const handleChange = (field: keyof Draft, value: any) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleCommit = async () => {
    if (!draft.slug || !draft.titleEn) {
        setStatusLog(prev => [...prev, "Error: Missing metadata (Slug or Title)."]);
        return;
    }

    setIsSubmitting(true);
    setStatusLog(prev => [...prev, "Initiating commit sequence..."]);
    
    const result = await commitResearch(draft, accessKey);
    
    if (result.success) {
        setStatusLog(prev => [...prev, "Commit accepted.", "Triggering remote build...", "Done."]);
    } else {
        setStatusLog(prev => [...prev, `Error: ${result.message}`]);
    }
    setIsSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <FadeIn>
          <div className="w-full max-w-md p-8 border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-ink-900/50">
             <div className="flex items-center gap-2 mb-6 text-stone-400 dark:text-stone-500">
                <Lock size={16} />
                <span className="text-xs font-mono uppercase tracking-widest">Research Access</span>
             </div>
             <form onSubmit={handleLogin} className="space-y-4">
                <input 
                    type="password" 
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="Enter Access Key"
                    className="w-full bg-transparent border-b border-stone-300 dark:border-stone-700 py-2 font-mono text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-500 transition-colors"
                    autoFocus
                />
                <button type="submit" className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                    Enter Node
                </button>
             </form>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <FadeIn>
        <header className="mb-12 border-b border-stone-200 dark:border-stone-800 pb-4 flex justify-between items-end">
            <div>
                <h1 className="font-serif text-2xl text-stone-900 dark:text-stone-100 flex items-center gap-3">
                    <Terminal size={24} className="text-stone-400" />
                    <SmoothText>Research Log</SmoothText>
                </h1>
                <p className="font-mono text-xs text-stone-400 dark:text-stone-500 mt-2">
                    Direct repository commit interface.
                </p>
            </div>
            <div className="font-mono text-[10px] text-stone-300 dark:text-stone-600 uppercase">
                {draft.isDraft ? 'Mode: Draft' : 'Mode: Public'}
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Meta Column */}
            <div className="md:col-span-4 space-y-8">
                <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-400">Slug</label>
                    <input 
                        type="text" 
                        value={draft.slug}
                        onChange={(e) => handleChange('slug', e.target.value)}
                        className="w-full bg-stone-50 dark:bg-ink-900 p-2 font-mono text-xs border border-transparent focus:border-stone-300 dark:focus:border-stone-700 outline-none transition-colors"
                        placeholder="e.g. dynamic-sparsity"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-400">Type</label>
                    <select 
                        value={draft.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="w-full bg-stone-50 dark:bg-ink-900 p-2 font-mono text-xs border border-transparent focus:border-stone-300 dark:focus:border-stone-700 outline-none transition-colors"
                    >
                        <option value={ContentType.ARTICLE}>Article</option>
                        <option value={ContentType.PROJECT}>Project/Artifact</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-stone-400">Research Thread</label>
                    <select 
                        value={draft.themeId}
                        onChange={(e) => handleChange('themeId', e.target.value)}
                        className="w-full bg-stone-50 dark:bg-ink-900 p-2 font-mono text-xs border border-transparent focus:border-stone-300 dark:focus:border-stone-700 outline-none transition-colors"
                    >
                        {THEMES.map(theme => (
                            <option key={theme.id} value={theme.id}>{theme.title.en}</option>
                        ))}
                    </select>
                </div>

                 <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-3 h-3 border border-stone-400 transition-colors ${draft.isDraft ? 'bg-stone-400' : 'bg-transparent'}`}></div>
                        <span className="font-mono text-xs text-stone-500 group-hover:text-stone-800 dark:group-hover:text-stone-300">Mark as Draft</span>
                        <input type="checkbox" className="hidden" checked={draft.isDraft} onChange={(e) => handleChange('isDraft', e.target.checked)} />
                    </label>
                </div>

                {/* Status Log */}
                <div className="mt-12 font-mono text-[10px] text-stone-400 space-y-1 h-32 overflow-y-auto border-t border-stone-100 dark:border-stone-800 pt-2">
                    {statusLog.map((log, i) => (
                        <div key={i} className="flex gap-2">
                            <span className="opacity-50">{">"}</span>
                            <span>{log}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Column */}
            <div className="md:col-span-8 space-y-8">
                
                {/* Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-400">Title (Native/Zh)</label>
                        <input 
                            type="text" 
                            value={draft.titleZh}
                            onChange={(e) => handleChange('titleZh', e.target.value)}
                            className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-1 font-serif text-lg focus:outline-none focus:border-stone-500 transition-colors"
                            placeholder="无题"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-stone-400">Title (Research/En)</label>
                        <input 
                            type="text" 
                            value={draft.titleEn}
                            onChange={(e) => handleChange('titleEn', e.target.value)}
                            className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-1 font-serif text-lg focus:outline-none focus:border-stone-500 transition-colors"
                            placeholder="Untitled"
                        />
                    </div>
                </div>

                {/* Abstracts */}
                <div className="space-y-2">
                     <label className="text-[10px] font-mono uppercase text-stone-400">Abstract (Context)</label>
                     <textarea 
                        value={draft.abstractEn}
                        onChange={(e) => handleChange('abstractEn', e.target.value)}
                        className="w-full bg-stone-50 dark:bg-ink-900 p-3 font-serif text-sm italic text-stone-600 dark:text-stone-400 border border-transparent focus:border-stone-300 dark:focus:border-stone-700 outline-none transition-colors h-20 resize-none"
                        placeholder="The core inquiry in english..."
                     />
                     <textarea 
                        value={draft.abstractZh}
                        onChange={(e) => handleChange('abstractZh', e.target.value)}
                        className="w-full bg-stone-50 dark:bg-ink-900 p-3 font-serif text-sm italic text-stone-600 dark:text-stone-400 border border-transparent focus:border-stone-300 dark:focus:border-stone-700 outline-none transition-colors h-20 resize-none"
                        placeholder="核心问题背景..."
                     />
                </div>

                {/* Main Content Area - Tabs */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                         <label className="text-[10px] font-mono uppercase text-stone-400 flex items-center gap-2">
                            <FileText size={12} />
                            Thinking Space (Markdown)
                         </label>
                         <div className="text-[10px] font-mono text-stone-300">
                            Supports LaTeX $$ and standard MD
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
                        <textarea 
                            value={draft.contentZh}
                            onChange={(e) => handleChange('contentZh', e.target.value)}
                            className="w-full h-full bg-stone-50 dark:bg-ink-900 p-4 font-mono text-sm leading-relaxed text-stone-700 dark:text-stone-300 border border-transparent focus:border-stone-300 dark:focus:border-stone-700 outline-none transition-colors resize-none"
                            placeholder="# 思考日志 (Zh)..."
                        />
                         <textarea 
                            value={draft.contentEn}
                            onChange={(e) => handleChange('contentEn', e.target.value)}
                            className="w-full h-full bg-stone-50 dark:bg-ink-900 p-4 font-mono text-sm leading-relaxed text-stone-700 dark:text-stone-300 border border-transparent focus:border-stone-300 dark:focus:border-stone-700 outline-none transition-colors resize-none"
                            placeholder="# Research Log (En)..."
                        />
                    </div>
                </div>

                {/* Action Area */}
                <div className="flex justify-end pt-8">
                    <button 
                        onClick={handleCommit}
                        disabled={isSubmitting}
                        className="group flex items-center gap-3 px-6 py-3 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-mono text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {isSubmitting ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                        )}
                        {isSubmitting ? 'Committing...' : 'Commit to Repository'}
                    </button>
                </div>

            </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default Admin;
