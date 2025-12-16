
import React, { useState, useEffect, useRef } from 'react';
import { FadeIn } from '../components/FadeIn';
import { ContentType, Draft, ResearchTheme, ContentItem } from '../types';
import { THEMES, CONTENT, AUTHOR } from '../services/data';
import { commitResearch } from '../services/publisher';
import { 
  Terminal, Lock, FileText, Send, Loader2, 
  FolderOpen, Image as ImageIcon, Layout as LayoutIcon, 
  ChevronRight, Save, Globe, Eye
} from 'lucide-react';

// --- Type Definitions for the Console ---
type EditorMode = 'edit' | 'preview';
type EditorLang = 'en' | 'zh';
type FileNode = {
    id: string;
    label: string;
    type: 'folder' | 'file';
    dataType?: 'article' | 'project' | 'theme' | 'config';
    data?: any;
    children?: FileNode[];
};

// --- Mock File System Construction ---
const buildFileSystem = (): FileNode[] => {
    return [
        {
            id: 'config',
            label: 'Global Config',
            type: 'folder',
            children: [
                { id: 'bio', label: 'Author Bio', type: 'file', dataType: 'config', data: AUTHOR }
            ]
        },
        {
            id: 'themes',
            label: 'Research Themes',
            type: 'folder',
            children: THEMES.map(t => ({
                id: `theme-${t.id}`,
                label: t.title.en,
                type: 'file',
                dataType: 'theme',
                data: t
            }))
        },
        {
            id: 'articles',
            label: 'Articles',
            type: 'folder',
            children: CONTENT.filter(c => c.type === ContentType.ARTICLE).map(c => ({
                id: c.id,
                label: c.title.en,
                type: 'file',
                dataType: 'article',
                data: c
            }))
        },
        {
            id: 'projects',
            label: 'Artifacts',
            type: 'folder',
            children: CONTENT.filter(c => c.type === ContentType.PROJECT).map(c => ({
                id: c.id,
                label: c.title.en,
                type: 'file',
                dataType: 'project',
                data: c
            }))
        }
    ];
};

const Admin: React.FC = () => {
  const [accessKey, setAccessKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  
  // Console State
  const [fileSystem] = useState<FileNode[]>(buildFileSystem());
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [activeLang, setActiveLang] = useState<EditorLang>('en');
  const [mode, setMode] = useState<EditorMode>('edit');
  
  // Working Draft State
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

  // Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.length > 0) setIsAuthenticated(true);
  };

  // File Selection Logic
  const handleSelectFile = (node: FileNode) => {
      if (node.type === 'folder') return;
      
      setActiveFile(node);
      // Map existing data to Draft format
      if (node.dataType === 'article' || node.dataType === 'project') {
          const item = node.data as ContentItem;
          setDraft({
              slug: item.slug,
              titleEn: item.title.en,
              titleZh: item.title.zh,
              type: item.type,
              themeId: item.themeId,
              abstractEn: item.abstract.en,
              abstractZh: item.abstract.zh,
              contentEn: typeof item.content.en === 'string' ? item.content.en : '',
              contentZh: typeof item.content.zh === 'string' ? item.content.zh : '',
              isDraft: false
          });
      } else {
          // Reset for New
          setDraft({
            slug: 'new-entry',
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
      }
  };

  const handleCreateNew = () => {
      setActiveFile(null);
      setDraft({
        slug: `draft-${Date.now()}`,
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
  }

  // Commit Logic
  const handleCommit = async () => {
    setIsSubmitting(true);
    setStatusLog(prev => [`[${new Date().toLocaleTimeString()}] Initiating commit...`, ...prev]);
    
    // 1. Commit Main Content
    const result = await commitResearch(draft, accessKey);
    
    if (result.success) {
        setStatusLog(prev => [`[${new Date().toLocaleTimeString()}] Success: ${result.message}`, ...prev]);
    } else {
        setStatusLog(prev => [`[${new Date().toLocaleTimeString()}] Error: ${result.message}`, ...prev]);
    }
    setIsSubmitting(false);
  };

  // Image Upload Logic
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setStatusLog(prev => [`Uploading asset: ${file.name}...`, ...prev]);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64Content = (reader.result as string).split(',')[1]; // Strip "data:image/png;base64,"
          
          // Send to API specifically as a binary file
          try {
             const path = `public/images/${draft.slug}/${file.name}`;
             const response = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessKey,
                    files: [{ path, content: base64Content, isBinary: true }],
                    message: `assets: upload ${file.name} for ${draft.slug}`
                })
             });
             
             if (response.ok) {
                 const imageUrl = `/images/${draft.slug}/${file.name}`;
                 setStatusLog(prev => [`Asset uploaded: ${imageUrl}`, ...prev]);
                 // Insert into Markdown
                 const mdImage = `\n![${file.name}](${imageUrl})\n`;
                 if (activeLang === 'en') {
                     setDraft(prev => ({ ...prev, contentEn: prev.contentEn + mdImage }));
                 } else {
                     setDraft(prev => ({ ...prev, contentZh: prev.contentZh + mdImage }));
                 }
             } else {
                 throw new Error('Upload failed');
             }
          } catch (err) {
             setStatusLog(prev => [`Upload Error: ${err}`, ...prev]);
          }
      };
      reader.readAsDataURL(file);
  };

  // --- Auth View ---
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-50 dark:bg-ink-950 transition-colors">
        <FadeIn>
          <div className="w-full max-w-sm p-8">
             <div className="flex justify-center mb-8">
                <Terminal size={32} className="text-stone-300 dark:text-stone-700" />
             </div>
             <form onSubmit={handleLogin} className="space-y-6">
                <input 
                    type="password" 
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="ACCESS KEY"
                    className="w-full bg-transparent border-b border-stone-300 dark:border-stone-700 py-2 font-mono text-center text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-500 tracking-[0.2em] transition-colors placeholder:text-stone-300 dark:placeholder:text-stone-800"
                    autoFocus
                />
             </form>
          </div>
        </FadeIn>
      </div>
    );
  }

  // --- Console View ---
  return (
    <div className="h-screen w-full flex bg-stone-50 dark:bg-ink-950 text-stone-800 dark:text-stone-200 overflow-hidden font-mono text-xs">
      
      {/* 1. Sidebar: Repository */}
      <aside className="w-64 border-r border-stone-200 dark:border-ink-800 flex flex-col bg-stone-100/50 dark:bg-ink-900/30">
         <div className="p-4 border-b border-stone-200 dark:border-ink-800 flex items-center justify-between">
             <span className="font-bold tracking-widest uppercase text-stone-400">Index</span>
             <button onClick={handleCreateNew} className="hover:text-stone-600 dark:hover:text-stone-300"><FileText size={14}/></button>
         </div>
         <div className="flex-grow overflow-y-auto p-2 space-y-1">
             {fileSystem.map(folder => (
                 <div key={folder.id} className="mb-4">
                     <div className="flex items-center gap-2 px-2 py-1 text-stone-400 dark:text-stone-500 uppercase tracking-wider font-bold text-[10px]">
                         <FolderOpen size={10} />
                         {folder.label}
                     </div>
                     <div className="ml-2 space-y-0.5 border-l border-stone-200 dark:border-ink-800 pl-2 mt-1">
                         {folder.children?.map(file => (
                             <button
                                key={file.id}
                                onClick={() => handleSelectFile(file)}
                                className={`w-full text-left px-2 py-1.5 rounded-sm truncate transition-colors ${activeFile?.id === file.id ? 'bg-stone-200 dark:bg-ink-800 text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-ink-800/50'}`}
                             >
                                {file.label}
                             </button>
                         ))}
                     </div>
                 </div>
             ))}
         </div>
         <div className="p-4 border-t border-stone-200 dark:border-ink-800">
             <div className="text-[10px] text-stone-400 break-all">
                Console Active<br/>
                v0.2.1
             </div>
         </div>
      </aside>

      {/* 2. Main Editor */}
      <main className="flex-1 flex flex-col relative">
          {/* Editor Header */}
          <header className="h-12 border-b border-stone-200 dark:border-ink-800 flex items-center justify-between px-6 bg-white dark:bg-ink-950">
              <div className="flex items-center gap-4">
                  <div className="flex bg-stone-100 dark:bg-ink-900 rounded p-0.5">
                      <button 
                        onClick={() => setActiveLang('en')}
                        className={`px-3 py-1 rounded-sm transition-colors ${activeLang === 'en' ? 'bg-white dark:bg-ink-800 shadow-sm' : 'text-stone-400'}`}
                      >EN</button>
                      <button 
                        onClick={() => setActiveLang('zh')}
                        className={`px-3 py-1 rounded-sm transition-colors ${activeLang === 'zh' ? 'bg-white dark:bg-ink-800 shadow-sm' : 'text-stone-400'}`}
                      >ZH</button>
                  </div>
                  <div className="w-px h-4 bg-stone-200 dark:bg-ink-800"></div>
                  <input 
                    type="text" 
                    value={activeLang === 'en' ? draft.titleEn : draft.titleZh}
                    onChange={(e) => {
                        const val = e.target.value;
                        setDraft(d => activeLang === 'en' ? {...d, titleEn: val} : {...d, titleZh: val})
                    }}
                    className="bg-transparent border-none outline-none font-serif text-sm w-96 text-stone-900 dark:text-stone-100 placeholder:text-stone-300"
                    placeholder="Document Title..."
                  />
              </div>
              <div className="flex items-center gap-4">
                   <button 
                        onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
                        className="flex items-center gap-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                    >
                        {mode === 'edit' ? <Eye size={14} /> : <LayoutIcon size={14} />}
                        <span className="uppercase tracking-widest">{mode}</span>
                   </button>
                   <button 
                        onClick={handleCommit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-1.5 rounded-sm hover:opacity-90 disabled:opacity-50"
                   >
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        <span className="uppercase tracking-widest">Commit</span>
                   </button>
              </div>
          </header>

          {/* Editor Body */}
          <div className="flex-1 overflow-hidden relative">
              {mode === 'edit' ? (
                  <textarea
                    value={activeLang === 'en' ? draft.contentEn : draft.contentZh}
                    onChange={(e) => {
                        const val = e.target.value;
                        setDraft(d => activeLang === 'en' ? {...d, contentEn: val} : {...d, contentZh: val})
                    }}
                    className="w-full h-full p-8 resize-none outline-none bg-stone-50 dark:bg-ink-950 font-mono text-sm leading-relaxed text-stone-700 dark:text-stone-300"
                    spellCheck={false}
                    placeholder="# Start writing..."
                  />
              ) : (
                  <div className="w-full h-full p-8 overflow-y-auto prose-academic mx-auto">
                      <h1 className="text-3xl font-serif font-bold mb-8">{activeLang === 'en' ? draft.titleEn : draft.titleZh}</h1>
                      <div className="whitespace-pre-wrap font-serif">
                          {activeLang === 'en' ? draft.contentEn : draft.contentZh}
                      </div>
                  </div>
              )}
          </div>
      </main>

      {/* 3. Inspector (Right Sidebar) */}
      <aside className="w-72 border-l border-stone-200 dark:border-ink-800 bg-white dark:bg-ink-950 flex flex-col">
          <div className="p-4 border-b border-stone-200 dark:border-ink-800">
               <span className="font-bold tracking-widest uppercase text-stone-400">Metadata</span>
          </div>
          <div className="p-4 space-y-6 flex-1 overflow-y-auto">
               <div className="space-y-1">
                   <label className="text-[10px] text-stone-400 uppercase">Slug</label>
                   <input 
                      className="w-full bg-stone-50 dark:bg-ink-900 p-2 border border-stone-200 dark:border-ink-800 outline-none"
                      value={draft.slug} 
                      onChange={e => setDraft(d => ({...d, slug: e.target.value}))} 
                   />
               </div>
               
               <div className="space-y-1">
                   <label className="text-[10px] text-stone-400 uppercase">Theme</label>
                   <select 
                      className="w-full bg-stone-50 dark:bg-ink-900 p-2 border border-stone-200 dark:border-ink-800 outline-none"
                      value={draft.themeId}
                      onChange={e => setDraft(d => ({...d, themeId: e.target.value}))}
                   >
                       {THEMES.map(t => <option key={t.id} value={t.id}>{t.title.en}</option>)}
                   </select>
               </div>

               <div className="space-y-1">
                   <label className="text-[10px] text-stone-400 uppercase">Abstract ({activeLang.toUpperCase()})</label>
                   <textarea 
                      className="w-full h-24 bg-stone-50 dark:bg-ink-900 p-2 border border-stone-200 dark:border-ink-800 outline-none resize-none font-serif italic"
                      value={activeLang === 'en' ? draft.abstractEn : draft.abstractZh}
                      onChange={e => {
                          const val = e.target.value;
                          setDraft(d => activeLang === 'en' ? {...d, abstractEn: val} : {...d, abstractZh: val})
                      }}
                   />
               </div>

               <div className="border-t border-stone-200 dark:border-ink-800 pt-6">
                   <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[10px] text-stone-400 uppercase group-hover:text-stone-600">Public Status</span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${!draft.isDraft ? 'bg-stone-800 dark:bg-stone-200' : 'bg-stone-200 dark:bg-ink-800'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white dark:bg-ink-950 transition-transform ${!draft.isDraft ? 'left-4.5' : 'left-0.5'}`}></div>
                        </div>
                        <input type="checkbox" className="hidden" checked={!draft.isDraft} onChange={e => setDraft(d => ({...d, isDraft: !e.target.checked}))} />
                   </label>
               </div>

               {/* Asset Manager */}
               <div className="border-t border-stone-200 dark:border-ink-800 pt-6">
                   <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] text-stone-400 uppercase">Assets</span>
                       <ImageIcon size={12} className="text-stone-400" />
                   </div>
                   <div 
                      className="border-2 border-dashed border-stone-200 dark:border-ink-800 rounded p-4 text-center cursor-pointer hover:border-stone-400 dark:hover:border-stone-600 transition-colors relative"
                      onClick={() => fileInputRef.current?.click()}
                   >
                       <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                       <span className="text-[10px] text-stone-400">Click to upload image to /{draft.slug}</span>
                   </div>
               </div>
          </div>
          
          {/* Logs */}
          <div className="h-32 bg-stone-900 dark:bg-black p-2 font-mono text-[9px] text-stone-400 overflow-y-auto">
              {statusLog.map((log, i) => <div key={i}>{log}</div>)}
          </div>
      </aside>

    </div>
  );
};

export default Admin;
