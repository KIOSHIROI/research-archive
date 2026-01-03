
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FadeIn } from '../components/FadeIn';
import { ContentType, Draft, ResearchTheme, ContentItem, SpeculativeItem, Author, Education } from '../types';
import { commitResearch } from '../services/publisher';
import { useContent, useThemes, useSpeculative, useAuthor } from '../contexts/ContentContext';
import { 
  Terminal, FileText, Loader2, 
  FolderOpen, Image as ImageIcon, Columns, 
  Save, Sidebar, Settings, 
  LayoutDashboard, Network, Sparkles, Plus, Trash2, User, ArrowUp, ArrowDown, Upload, LogOut, FileUp
} from 'lucide-react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

// --- Types ---
type EditorLang = 'en' | 'zh';
type AdminTab = 'dashboard' | 'editor' | 'themes' | 'speculative' | 'profile';

type FileNode = {
    id: string;
    label: string;
    type: 'folder' | 'file';
    dataType?: 'article' | 'project';
    data?: any;
    children?: FileNode[];
};

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [accessKey, setAccessKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Layout State
  const [showSidebar, setShowSidebar] = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  // Context Data
  const { content, themes: globalThemes, speculative: globalSpeculative, author: globalAuthor, refresh, updateGlobalState } = useContent(); 

  // --- State: Editor ---
  const [fileSystem, setFileSystem] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [activeLang, setActiveLang] = useState<EditorLang>('en');
  const [draft, setDraft] = useState<Draft>({
    slug: '', titleZh: '', titleEn: '', type: ContentType.ARTICLE, themeId: '', 
    abstractZh: '', abstractEn: '', contentZh: '', contentEn: '', isDraft: true,
    journal: '', repoUrl: '', techStack: '', notionUrl: ''
  });

  // --- State: Theme Manager ---
  const [localThemes, setLocalThemes] = useState<ResearchTheme[]>([]);
  // Use Ref to avoid closure staleness in async/event handlers
  const uploadingThemeIdRef = useRef<string | null>(null); 

  // --- State: Speculative Manager ---
  const [localSpeculative, setLocalSpeculative] = useState<SpeculativeItem[]>([]);

  // --- State: Profile Manager ---
  const [localAuthor, setLocalAuthor] = useState<Author>(globalAuthor);

  // Session Persistence
  useEffect(() => {
    const storedKey = sessionStorage.getItem('adminKey');
    if (storedKey) {
        setAccessKey(storedKey);
        setIsAuthenticated(true);
    }
  }, []);

  // Sync Global State to Local State on Load
  useEffect(() => {
      setLocalThemes(globalThemes);
      setLocalSpeculative(globalSpeculative.items);
      setLocalAuthor(globalAuthor);
      
      // Build Filesystem
      const fs: FileNode[] = [
        {
            id: 'articles',
            label: 'Articles',
            type: 'folder',
            children: content.filter(c => c.type === ContentType.ARTICLE).map(c => ({
                id: c.id,
                label: c.title.en + (c.isDraft ? ' [DRAFT]' : ''),
                type: 'file',
                dataType: 'article',
                data: c
            }))
        },
        {
            id: 'projects',
            label: 'Artifacts',
            type: 'folder',
            children: content.filter(c => c.type === ContentType.PROJECT).map(c => ({
                id: c.id,
                label: c.title.en + (c.isDraft ? ' [DRAFT]' : ''),
                type: 'file',
                dataType: 'project',
                data: c
            }))
        }
      ];
      setFileSystem(fs);
  }, [content, globalThemes, globalSpeculative, globalAuthor]);

  // Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.length > 0) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminKey', accessKey);
    }
  };

  // --- Logic: Editor ---
  const handleSelectFile = (node: FileNode) => {
      if (node.type === 'folder') return;
      setActiveFile(node);
      const item = node.data as ContentItem;
      setDraft({
          slug: item.slug,
          titleEn: item.title.en, titleZh: item.title.zh,
          type: item.type, themeId: item.themeId,
          abstractEn: item.abstract.en, abstractZh: item.abstract.zh,
          contentEn: typeof item.content.en === 'string' ? item.content.en : '',
          contentZh: typeof item.content.zh === 'string' ? item.content.zh : '',
          isDraft: item.isDraft !== false,
          journal: item.metadata?.journal || '',
          repoUrl: item.metadata?.repoUrl || '',
          techStack: item.metadata?.techStack?.join(', ') || '',
          notionUrl: item.metadata?.notionUrl || ''
      });
      setActiveTab('editor');
  };

  const handleCreateNew = () => {
      setActiveFile(null);
      setDraft({
        slug: `draft-${Date.now().toString().slice(-6)}`,
        titleZh: '', titleEn: '',
        type: ContentType.ARTICLE, themeId: localThemes[0]?.id || '',
        abstractZh: '', abstractEn: '', contentZh: '', contentEn: '',
        isDraft: true,
        journal: '', repoUrl: '', techStack: '', notionUrl: ''
      });
      setActiveTab('editor');
  }

  // --- Logic: Commit System ---
  const handleGlobalCommit = async () => {
    setIsSubmitting(true);
    setStatusLog(prev => [`[${new Date().toLocaleTimeString()}] System Snapshot Initiated...`, ...prev]);

    // 1. Prepare Content List
    let updatedContentList = [...content];
    if (activeTab === 'editor' && draft.slug) {
        const newItem: ContentItem = {
            id: draft.slug, 
            type: draft.type,
            title: { en: draft.titleEn, zh: draft.titleZh },
            abstract: { en: draft.abstractEn, zh: draft.abstractZh },
            date: new Date().toISOString().split('T')[0],
            themeId: draft.themeId,
            slug: draft.slug,
            content: { en: draft.contentEn, zh: draft.contentZh },
            isDraft: draft.isDraft,
            metadata: {
                journal: draft.journal,
                repoUrl: draft.repoUrl,
                techStack: draft.techStack ? draft.techStack.split(',').map(s => s.trim()) : undefined,
                notionUrl: draft.notionUrl || undefined
            }
        };
        updatedContentList = updatedContentList.filter(c => c.slug !== draft.slug);
        updatedContentList.push(newItem);
    }

    // 2. Prepare JSON Payload
    const indexPayload = JSON.stringify({
        author: localAuthor,
        themes: localThemes, 
        speculative: { title: globalSpeculative.title, items: localSpeculative }, 
        content: updatedContentList
    }, null, 2);

    // 3. Commit
    const result = await commitResearch(draft, accessKey, indexPayload);
    
    if (result.success) {
        setStatusLog(prev => [`Snapshot Saved & Committed.`, ...prev]);
        updateGlobalState({
            author: localAuthor,
            themes: localThemes,
            speculative: { ...globalSpeculative, items: localSpeculative },
            content: updatedContentList
        });
    } else {
        setStatusLog(prev => [`Error: ${result.message}`, ...prev]);
    }
    setIsSubmitting(false);
  };

  // Image Upload Logic (Editor)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setStatusLog(prev => [`Uploading asset: ${file.name}...`, ...prev]);
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64Content = (reader.result as string).split(',')[1];
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
                 const mdImage = `\n![${file.name}](${imageUrl})\n`;
                 setDraft(prev => activeLang === 'en' ? { ...prev, contentEn: prev.contentEn + mdImage } : { ...prev, contentZh: prev.contentZh + mdImage });
             } else throw new Error('Upload failed');
          } catch (err) { setStatusLog(prev => [`Upload Error: ${err}`, ...prev]); }
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Profile Image Upload Logic
  const profileInputRef = useRef<HTMLInputElement>(null);
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setStatusLog(prev => [`Uploading profile: ${file.name}...`, ...prev]);
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64Content = (reader.result as string).split(',')[1];
          const ext = file.name.split('.').pop() || 'jpg';
          const filename = `profile.${ext}`;
          try {
             const path = `public/images/${filename}`;
             const response = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessKey,
                    files: [{ path, content: base64Content, isBinary: true }],
                    message: `profile: update avatar image`
                })
             });
             if (response.ok) {
                 const imageUrl = `/images/${filename}?t=${Date.now()}`; // Add timestamp to bust cache
                 setStatusLog(prev => [`Profile updated: ${imageUrl}`, ...prev]);
                 setLocalAuthor({ ...localAuthor, avatar: imageUrl });
             } else throw new Error('Upload failed');
          } catch (err) { setStatusLog(prev => [`Upload Error: ${err}`, ...prev]); }
      };
      reader.readAsDataURL(file);
      if (profileInputRef.current) profileInputRef.current.value = '';
  }

  // Resume Upload Logic
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const allowedTypes = [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
          setStatusLog(prev => [`Warning: Unusual file type ${file.type}. Uploading anyway...`, ...prev]);
      }

      setStatusLog(prev => [`Uploading resume: ${file.name}...`, ...prev]);
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64Content = (reader.result as string).split(',')[1];
          const ext = file.name.split('.').pop() || 'pdf';
          const filename = `resume.${ext}`; 
          
          try {
             const path = `public/files/${filename}`;
             const response = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessKey,
                    files: [{ path, content: base64Content, isBinary: true }],
                    message: `profile: update resume file`
                })
             });
             if (response.ok) {
                 const fileUrl = `/files/${filename}?t=${Date.now()}`;
                 setStatusLog(prev => [`Resume updated: ${fileUrl}`, ...prev]);
                 setLocalAuthor({ ...localAuthor, resumeUrl: fileUrl });
             } else throw new Error('Upload failed');
          } catch (err) { setStatusLog(prev => [`Upload Error: ${err}`, ...prev]); }
      };
      reader.readAsDataURL(file);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
  }

  // Theme Cover Image Upload Logic
  const themeInputRef = useRef<HTMLInputElement>(null);
  const triggerThemeUpload = (id: string) => {
      uploadingThemeIdRef.current = id;
      themeInputRef.current?.click();
  }

  const handleThemeCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const targetId = uploadingThemeIdRef.current;

      if (!file) return;
      if (!targetId) {
          setStatusLog(prev => [`Error: No target theme ID found.`, ...prev]);
          return;
      }
      
      setStatusLog(prev => [`Uploading theme cover for ${targetId}...`, ...prev]);
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64Content = (reader.result as string).split(',')[1];
          const ext = file.name.split('.').pop() || 'jpg';
          const filename = `${targetId}.${ext}`;
          
          try {
             const path = `public/images/themes/${filename}`;
             const response = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessKey,
                    files: [{ path, content: base64Content, isBinary: true }],
                    message: `theme: update cover for ${targetId}`
                })
             });
             
             if (response.ok) {
                 const imageUrl = `/images/themes/${filename}?t=${Date.now()}`;
                 setStatusLog(prev => [`Theme cover updated: ${imageUrl}`, ...prev]);
                 
                 // Update local state - use functional update for safety
                 setLocalThemes(prevThemes => prevThemes.map(t => {
                     if (t.id === targetId) {
                         return { ...t, coverImage: imageUrl };
                     }
                     return t;
                 }));
             } else throw new Error('Upload failed');
          } catch (err) { setStatusLog(prev => [`Upload Error: ${err}`, ...prev]); }
          
          uploadingThemeIdRef.current = null;
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be selected again
      if (themeInputRef.current) themeInputRef.current.value = '';
  }


  // Theme Helpers
  const moveTheme = (index: number, direction: 'up' | 'down') => {
      const newThemes = [...localThemes];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newThemes.length) {
          [newThemes[index], newThemes[targetIndex]] = [newThemes[targetIndex], newThemes[index]];
          // Update order property
          newThemes.forEach((t, i) => t.order = i + 1);
          setLocalThemes(newThemes);
      }
  };

  // Profile Helpers
  const addEducation = () => {
      const newEdu: Education = {
          school: { en: 'School Name', zh: '学校名称' },
          department: { en: 'Department', zh: '院系' },
          major: { en: 'Major', zh: '专业' },
          stage: { en: 'Stage', zh: '阶段' }
      };
      setLocalAuthor({...localAuthor, education: [...localAuthor.education, newEdu]});
  };

  const removeEducation = (index: number) => {
      const newEdu = localAuthor.education.filter((_, i) => i !== index);
      setLocalAuthor({...localAuthor, education: newEdu});
  };

  const updateEducation = (index: number, field: keyof Education, lang: 'en' | 'zh', value: string) => {
      const newEdu = [...localAuthor.education];
      newEdu[index] = { ...newEdu[index], [field]: { ...newEdu[index][field], [lang]: value } };
      setLocalAuthor({...localAuthor, education: newEdu});
  };

  // --- Renderers ---
  if (!isAuthenticated) return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-50 dark:bg-ink-950 transition-colors">
        <FadeIn><div className="w-full max-w-sm p-8 text-center">
             <Terminal size={32} className="mx-auto mb-8 text-stone-300 dark:text-stone-700" />
             <div className="text-stone-400 text-xs mb-4 tracking-widest uppercase">Research Command Center</div>
             <form onSubmit={handleLogin}>
                <input type="password" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} placeholder="ACCESS KEY"
                    className="w-full bg-transparent border-b border-stone-300 dark:border-stone-700 py-2 font-mono text-center text-stone-800 dark:text-stone-200 focus:outline-none tracking-[0.2em]" autoFocus />
             </form>
          </div></FadeIn>
      </div>
  );

  return (
    <div className="h-full w-full flex bg-stone-50 dark:bg-ink-950 text-stone-800 dark:text-stone-200 overflow-hidden font-mono text-xs">
      
      {/* 1. Main Navigation Sidebar */}
      <aside className="w-16 border-r border-stone-200 dark:border-ink-800 flex flex-col items-center py-4 bg-white dark:bg-ink-950 shrink-0 z-20">
          <div className="mb-8 text-stone-900 dark:text-white"><Terminal size={20} /></div>
          
          {/* Scrollable Nav Area */}
          <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center gap-6 pb-4">
              <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-stone-100 dark:bg-ink-800 text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-600'}`} title="Dashboard"><LayoutDashboard size={18} /></button>
              <button onClick={() => setActiveTab('editor')} className={`p-3 rounded-md transition-colors ${activeTab === 'editor' ? 'bg-stone-100 dark:bg-ink-800 text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-600'}`} title="Editor"><FileText size={18} /></button>
              <button onClick={() => setActiveTab('themes')} className={`p-3 rounded-md transition-colors ${activeTab === 'themes' ? 'bg-stone-100 dark:bg-ink-800 text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-600'}`} title="Themes"><Network size={18} /></button>
              <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-md transition-colors ${activeTab === 'profile' ? 'bg-stone-100 dark:bg-ink-800 text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-600'}`} title="Profile"><User size={18} /></button>
              <button onClick={() => setActiveTab('speculative')} className={`p-3 rounded-md transition-colors ${activeTab === 'speculative' ? 'bg-stone-100 dark:bg-ink-800 text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-600'}`} title="Speculative Notes"><Sparkles size={18} /></button>
          </div>

          <div className="mt-4 flex flex-col gap-4 border-t border-stone-100 dark:border-ink-800 pt-4 w-full items-center">
              <button onClick={() => navigate('/')} className="p-3 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors" title="Exit to Home">
                  <LogOut size={18} />
              </button>
              <button onClick={handleGlobalCommit} disabled={isSubmitting} className={`p-3 rounded-md transition-colors ${isSubmitting ? 'animate-pulse text-stone-400' : 'bg-stone-900 text-white hover:bg-stone-700'}`} title="Commit All Changes">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              </button>
          </div>
      </aside>

      {/* 2. Content Area based on Tabs */}
      
      {/* --- EDITOR --- */}
      {activeTab === 'editor' && (
          <>
            <aside className={`border-r border-stone-200 dark:border-ink-800 flex flex-col bg-stone-100/50 dark:bg-ink-900/30 transition-all duration-300 ${showSidebar ? 'w-64' : 'w-0 overflow-hidden opacity-0'}`}>
                <div className="p-4 border-b border-stone-200 dark:border-ink-800 flex items-center justify-between min-w-[16rem]">
                    <span className="font-bold tracking-widest uppercase text-stone-400">Files</span>
                    <button onClick={handleCreateNew} className="hover:text-stone-600 dark:hover:text-stone-300" title="New Draft"><Plus size={14}/></button>
                </div>
                <div className="flex-grow overflow-y-auto p-2 space-y-1 min-w-[16rem]">
                    {fileSystem.map(folder => (
                        <div key={folder.id} className="mb-4">
                            <div className="flex items-center gap-2 px-2 py-1 text-stone-400 dark:text-stone-500 uppercase tracking-wider font-bold text-[10px]"><FolderOpen size={10} />{folder.label}</div>
                            <div className="ml-2 space-y-0.5 border-l border-stone-200 dark:border-ink-800 pl-2 mt-1">
                                {folder.children?.map(file => (
                                    <button key={file.id} onClick={() => handleSelectFile(file)} className={`w-full text-left px-2 py-1.5 rounded-sm truncate transition-colors ${activeFile?.id === file.id ? 'bg-stone-200 dark:bg-ink-800 text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200/50'}`}>{file.label}</button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
            <main className="flex-1 flex flex-col relative min-w-0">
                <header className="h-12 border-b border-stone-200 dark:border-ink-800 flex items-center justify-between px-4 bg-white dark:bg-ink-950 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowSidebar(!showSidebar)} className="text-stone-400 hover:text-stone-600"><Sidebar size={14} /></button>
                        <div className="flex bg-stone-100 dark:bg-ink-900 rounded p-0.5">
                            <button onClick={() => setActiveLang('en')} className={`px-3 py-1 rounded-sm ${activeLang === 'en' ? 'bg-white dark:bg-ink-800 shadow-sm' : 'text-stone-400'}`}>EN</button>
                            <button onClick={() => setActiveLang('zh')} className={`px-3 py-1 rounded-sm ${activeLang === 'zh' ? 'bg-white dark:bg-ink-800 shadow-sm' : 'text-stone-400'}`}>ZH</button>
                        </div>
                        <input type="text" value={activeLang === 'en' ? draft.titleEn : draft.titleZh} onChange={(e) => { const val = e.target.value; setDraft(d => activeLang === 'en' ? {...d, titleEn: val} : {...d, titleZh: val})}} className="bg-transparent border-none outline-none font-serif text-sm w-48 md:w-80 text-stone-900 dark:text-stone-100 truncate" placeholder="Title..." />
                    </div>
                    <button onClick={() => setShowInspector(!showInspector)} className="text-stone-400 hover:text-stone-600"><Settings size={14} /></button>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col border-r border-stone-200 dark:border-ink-800">
                        <textarea value={activeLang === 'en' ? draft.contentEn : draft.contentZh} onChange={(e) => { const val = e.target.value; setDraft(d => activeLang === 'en' ? {...d, contentEn: val} : {...d, contentZh: val})}} className="flex-1 w-full p-8 resize-none outline-none bg-white dark:bg-ink-950 font-mono text-sm leading-relaxed text-stone-700 dark:text-stone-300" spellCheck={false} placeholder="# Start writing..." />
                    </div>
                    <div className="flex-1 flex flex-col bg-stone-50 dark:bg-ink-900/20 hidden md:flex">
                        <div className="flex-1 overflow-y-auto p-8"><div className="prose-academic mx-auto">
                            <h1 className="text-3xl font-serif font-bold mb-8">{activeLang === 'en' ? draft.titleEn : draft.titleZh}</h1>
                            <MarkdownRenderer content={activeLang === 'en' ? draft.contentEn : draft.contentZh} />
                        </div></div>
                    </div>
                </div>
            </main>
            <aside className={`border-l border-stone-200 dark:border-ink-800 bg-white dark:bg-ink-950 flex flex-col transition-all duration-300 ${showInspector ? 'w-72' : 'w-0 overflow-hidden opacity-0'}`}>
                <div className="p-4 border-b border-stone-200 dark:border-ink-800 min-w-[18rem]"><span className="font-bold tracking-widest uppercase text-stone-400">Metadata</span></div>
                <div className="p-4 space-y-6 flex-1 overflow-y-auto min-w-[18rem]">
                    <div className="space-y-1"><label className="text-[10px] text-stone-400 uppercase">Slug</label><input className="w-full bg-stone-50 dark:bg-ink-900 p-2 border border-stone-200 dark:border-ink-800 outline-none" value={draft.slug} onChange={e => setDraft(d => ({...d, slug: e.target.value}))} /></div>
                    <div className="space-y-1"><label className="text-[10px] text-stone-400 uppercase">Theme</label><select className="w-full bg-stone-50 dark:bg-ink-900 p-2 border border-stone-200 dark:border-ink-800 outline-none" value={draft.themeId} onChange={e => setDraft(d => ({...d, themeId: e.target.value}))}>{localThemes.map(t => <option key={t.id} value={t.id}>{t.title.en}</option>)}</select></div>
                    
                    {/* Extended Metadata Fields */}
                    <div className="space-y-1"><label className="text-[10px] text-stone-400 uppercase">Journal / Publication</label><input className="w-full bg-stone-50 dark:bg-ink-900 p-2 border border-stone-200 dark:border-ink-800 outline-none" value={draft.journal} onChange={e => setDraft(d => ({...d, journal: e.target.value}))} placeholder="e.g. CVPR 2024" /></div>
                    <div className="space-y-1"><label className="text-[10px] text-stone-400 uppercase">Repo URL</label><input className="w-full bg-stone-50 dark:bg-ink-900 p-2 border border-stone-200 dark:border-ink-800 outline-none" value={draft.repoUrl} onChange={e => setDraft(d => ({...d, repoUrl: e.target.value}))} placeholder="github.com/..." /></div>
                    <div className="space-y-1"><label className="text-[10px] text-stone-400 uppercase">Tech Stack (Comma sep)</label><input className="w-full bg-stone-50 dark:bg-ink-900 p-2 border border-stone-200 dark:border-ink-800 outline-none" value={draft.techStack} onChange={e => setDraft(d => ({...d, techStack: e.target.value}))} placeholder="React, Python, ..." /></div>
                    <div className="space-y-1"><label className="text-[10px] text-stone-400 uppercase">Notion URL</label><input className="w-full bg-stone-50 dark:bg-ink-900 p-2 border border-stone-200 dark:border-ink-800 outline-none" value={draft.notionUrl} onChange={e => setDraft(d => ({...d, notionUrl: e.target.value}))} placeholder="https://www.notion.so/..." /></div>

                    <div className="border-t border-stone-200 dark:border-ink-800 pt-6">
                        <label className="flex items-center justify-between cursor-pointer group"><span className="text-[10px] text-stone-400 uppercase">Draft Status</span><div className={`w-8 h-4 rounded-full relative transition-colors ${draft.isDraft ? 'bg-stone-800 dark:bg-stone-200' : 'bg-stone-200 dark:bg-ink-800'}`}><div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white dark:bg-ink-950 transition-transform ${draft.isDraft ? 'left-4.5' : 'left-0.5'}`}></div></div><input type="checkbox" className="hidden" checked={draft.isDraft} onChange={e => setDraft(d => ({...d, isDraft: e.target.checked}))} /></label>
                    </div>
                    <div className="border-t border-stone-200 dark:border-ink-800 pt-6"><div className="border-2 border-dashed border-stone-200 dark:border-ink-800 rounded p-4 text-center cursor-pointer hover:border-stone-400" onClick={() => fileInputRef.current?.click()}><input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" /><span className="text-[10px] text-stone-400">Upload Asset</span></div></div>
                </div>
            </aside>
          </>
      )}

      {/* --- DASHBOARD --- */}
      {activeTab === 'dashboard' && (
          <main className="flex-1 p-12 overflow-y-auto bg-stone-50 dark:bg-ink-950">
              <h1 className="text-3xl font-serif mb-8 text-stone-900 dark:text-stone-100">Research Command Center</h1>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="bg-white dark:bg-ink-900 p-6 border border-stone-200 dark:border-ink-800 rounded-sm">
                      <div className="text-stone-400 uppercase text-[10px] tracking-widest mb-2">Total Drafts</div>
                      <div className="text-4xl font-mono">{content.length}</div>
                  </div>
                  <div className="bg-white dark:bg-ink-900 p-6 border border-stone-200 dark:border-ink-800 rounded-sm">
                      <div className="text-stone-400 uppercase text-[10px] tracking-widest mb-2">Published</div>
                      <div className="text-4xl font-mono">{content.filter(c => !c.isDraft).length}</div>
                  </div>
                  <div className="bg-white dark:bg-ink-900 p-6 border border-stone-200 dark:border-ink-800 rounded-sm">
                      <div className="text-stone-400 uppercase text-[10px] tracking-widest mb-2">Active Themes</div>
                      <div className="text-4xl font-mono">{localThemes.filter(t => t.status === 'Active').length}</div>
                  </div>
                   <div className="bg-white dark:bg-ink-900 p-6 border border-stone-200 dark:border-ink-800 rounded-sm">
                      <div className="text-stone-400 uppercase text-[10px] tracking-widest mb-2">System Status</div>
                      <div className="text-4xl font-mono text-emerald-500">OK</div>
                  </div>
              </div>
              <div className="mt-12">
                  <h3 className="text-stone-400 uppercase text-[10px] tracking-widest mb-4">System Log</h3>
                  <div className="bg-black text-stone-400 p-4 font-mono text-[10px] h-64 overflow-y-auto rounded-sm border border-stone-800">
                      {statusLog.length === 0 && <div>System Ready. Awaiting commands.</div>}
                      {statusLog.map((log, i) => <div key={i}>{log}</div>)}
                  </div>
              </div>
          </main>
      )}

      {/* --- PROFILE MANAGER --- */}
      {activeTab === 'profile' && (
          <main className="flex-1 p-12 overflow-y-auto bg-stone-50 dark:bg-ink-950">
               <h1 className="text-3xl font-serif text-stone-900 dark:text-stone-100 mb-8">Author Profile</h1>
               <div className="max-w-4xl space-y-12">
                   
                   {/* Profile Image */}
                   <div className="bg-white dark:bg-ink-900 p-6 border border-stone-200 dark:border-ink-800 rounded-sm flex gap-8 items-start">
                       <div className="w-32 h-40 bg-stone-100 dark:bg-stone-800 overflow-hidden relative group">
                           {localAuthor.avatar ? (
                               <img src={localAuthor.avatar} alt="Current Profile" className="w-full h-full object-cover" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-stone-400"><User /></div>
                           )}
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => profileInputRef.current?.click()}>
                               <Upload className="text-white" size={24} />
                           </div>
                           <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                       </div>
                       <div className="flex-1">
                           <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Profile Photo</h3>
                           <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                               Upload a portrait. Recommended ratio 3:4.
                           </p>
                           <div className="text-[10px] font-mono text-stone-400 break-all">{localAuthor.avatar || "No image set"}</div>
                       </div>
                   </div>

                   {/* Basic Info */}
                   <div className="bg-white dark:bg-ink-900 p-6 border border-stone-200 dark:border-ink-800 rounded-sm">
                       <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Identity</h3>
                       <div className="grid grid-cols-2 gap-6">
                           <div><label className="text-[10px] uppercase text-stone-400">Name (EN)</label><input className="w-full bg-stone-50 dark:bg-ink-950 p-2 border-b border-stone-200 dark:border-ink-800" value={localAuthor.name.en} onChange={e => setLocalAuthor({...localAuthor, name: {...localAuthor.name, en: e.target.value}})} /></div>
                           <div><label className="text-[10px] uppercase text-stone-400">Name (ZH)</label><input className="w-full bg-stone-50 dark:bg-ink-950 p-2 border-b border-stone-200 dark:border-ink-800" value={localAuthor.name.zh} onChange={e => setLocalAuthor({...localAuthor, name: {...localAuthor.name, zh: e.target.value}})} /></div>
                           <div><label className="text-[10px] uppercase text-stone-400">Role (EN)</label><input className="w-full bg-stone-50 dark:bg-ink-950 p-2 border-b border-stone-200 dark:border-ink-800" value={localAuthor.role.en} onChange={e => setLocalAuthor({...localAuthor, role: {...localAuthor.role, en: e.target.value}})} /></div>
                           <div><label className="text-[10px] uppercase text-stone-400">Role (ZH)</label><input className="w-full bg-stone-50 dark:bg-ink-950 p-2 border-b border-stone-200 dark:border-ink-800" value={localAuthor.role.zh} onChange={e => setLocalAuthor({...localAuthor, role: {...localAuthor.role, zh: e.target.value}})} /></div>
                       </div>
                       
                       {/* Resume URL Input */}
                       <div className="mt-6 pt-6 border-t border-stone-100 dark:border-ink-800">
                           <div className="flex justify-between items-end mb-2">
                               <label className="text-[10px] uppercase text-stone-400 block">Resume / CV</label>
                               <button onClick={() => resumeInputRef.current?.click()} className="flex items-center gap-1 text-[10px] uppercase text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors">
                                   <FileUp size={12} /> Upload PDF/DOC
                               </button>
                           </div>
                           <input 
                               className="w-full bg-stone-50 dark:bg-ink-950 p-2 border-b border-stone-200 dark:border-ink-800 text-sm font-mono text-stone-600 dark:text-stone-300 placeholder-stone-300" 
                               value={localAuthor.resumeUrl || ''} 
                               onChange={e => setLocalAuthor({...localAuthor, resumeUrl: e.target.value})}
                               placeholder="e.g. /files/resume.pdf" 
                           />
                           <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                       </div>
                   </div>

                   {/* Bio */}
                   <div className="bg-white dark:bg-ink-900 p-6 border border-stone-200 dark:border-ink-800 rounded-sm">
                       <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Biography (Markdown Supported)</h3>
                       <div className="space-y-6">
                           <div>
                               <label className="text-[10px] uppercase text-stone-400 mb-2 block">Bio (EN)</label>
                               <textarea className="w-full h-32 bg-stone-50 dark:bg-ink-950 p-4 border border-stone-200 dark:border-ink-800 font-mono text-sm" value={localAuthor.bio.en} onChange={e => setLocalAuthor({...localAuthor, bio: {...localAuthor.bio, en: e.target.value}})} />
                           </div>
                           <div>
                               <label className="text-[10px] uppercase text-stone-400 mb-2 block">Bio (ZH)</label>
                               <textarea className="w-full h-32 bg-stone-50 dark:bg-ink-950 p-4 border border-stone-200 dark:border-ink-800 font-mono text-sm" value={localAuthor.bio.zh} onChange={e => setLocalAuthor({...localAuthor, bio: {...localAuthor.bio, zh: e.target.value}})} />
                           </div>
                       </div>
                   </div>

                   {/* Education */}
                   <div className="bg-white dark:bg-ink-900 p-6 border border-stone-200 dark:border-ink-800 rounded-sm">
                       <div className="flex justify-between items-center mb-6">
                           <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Education</h3>
                           <button onClick={addEducation} className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"><Plus size={14}/></button>
                       </div>
                       <div className="space-y-4">
                           {localAuthor.education.map((edu, idx) => (
                               <div key={idx} className="p-4 bg-stone-50 dark:bg-ink-950 border border-stone-100 dark:border-ink-800 relative group">
                                   <button onClick={() => removeEducation(idx)} className="absolute top-2 right-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                   <div className="grid grid-cols-2 gap-4 mb-2">
                                       <input className="bg-transparent border-b border-stone-200 dark:border-ink-800 w-full" value={edu.school.en} onChange={e => updateEducation(idx, 'school', 'en', e.target.value)} placeholder="School (EN)" />
                                       <input className="bg-transparent border-b border-stone-200 dark:border-ink-800 w-full" value={edu.school.zh} onChange={e => updateEducation(idx, 'school', 'zh', e.target.value)} placeholder="School (ZH)" />
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                       <input className="bg-transparent border-b border-stone-200 dark:border-ink-800 w-full text-xs text-stone-500" value={edu.major.en} onChange={e => updateEducation(idx, 'major', 'en', e.target.value)} placeholder="Major (EN)" />
                                       <input className="bg-transparent border-b border-stone-200 dark:border-ink-800 w-full text-xs text-stone-500" value={edu.stage.en} onChange={e => updateEducation(idx, 'stage', 'en', e.target.value)} placeholder="Stage (EN)" />
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
          </main>
      )}

      {/* --- THEMES MANAGER (Topology Fix) --- */}
      {activeTab === 'themes' && (
          <main className="flex-1 p-12 overflow-y-auto bg-stone-50 dark:bg-ink-950">
              {/* Hidden File Input for Themes */}
              <input type="file" ref={themeInputRef} className="hidden" accept="image/*" onChange={handleThemeCoverUpload} />

              <div className="flex justify-between items-baseline mb-8">
                  <h1 className="text-3xl font-serif text-stone-900 dark:text-stone-100">Theme Topology</h1>
                  <button onClick={() => {
                      const newTheme: ResearchTheme = {
                          id: `theme-${Date.now()}`, title: {en:'New Theme', zh:'新主题'},
                          description: {en:'', zh:''}, hypothesis: {en:'', zh:''}, status: 'Exploring', order: localThemes.length + 1
                      };
                      setLocalThemes([...localThemes, newTheme]);
                  }} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"><Plus size={14}/> Add Theme</button>
              </div>
              <div className="space-y-6 max-w-5xl">
                  {localThemes.map((theme, idx) => (
                      <div key={theme.id} className="bg-white dark:bg-ink-900 p-6 border border-stone-200 dark:border-ink-800 rounded-sm relative group flex flex-col md:flex-row gap-6">
                          {/* Ordering Controls */}
                          <div className="flex md:flex-col gap-2 justify-center border-r border-stone-100 dark:border-ink-800 pr-4 shrink-0">
                              <button onClick={() => moveTheme(idx, 'up')} disabled={idx === 0} className="text-stone-300 hover:text-stone-600 disabled:opacity-20"><ArrowUp size={16}/></button>
                              <div className="text-center font-mono text-xs text-stone-400">{idx + 1}</div>
                              <button onClick={() => moveTheme(idx, 'down')} disabled={idx === localThemes.length - 1} className="text-stone-300 hover:text-stone-600 disabled:opacity-20"><ArrowDown size={16}/></button>
                          </div>
                          
                          {/* Image Cover Preview / Upload */}
                          <div className="w-full md:w-48 shrink-0">
                             <div className="block text-[10px] uppercase text-stone-400 mb-2">Cover Image</div>
                             <div 
                                onClick={() => triggerThemeUpload(theme.id)}
                                className="w-full aspect-[4/3] bg-stone-100 dark:bg-stone-800 relative cursor-pointer group/img border border-stone-200 dark:border-ink-700 hover:border-stone-400 dark:hover:border-stone-500 transition-colors overflow-hidden"
                             >
                                 {theme.coverImage ? (
                                     <img src={theme.coverImage} alt="cover" className="w-full h-full object-cover" />
                                 ) : (
                                     <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-600"><ImageIcon size={24} /></div>
                                 )}
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                     <Upload className="text-white" size={20} />
                                 </div>
                             </div>
                             <input 
                                className="w-full mt-2 bg-transparent text-[10px] text-stone-400 border-b border-stone-200 dark:border-ink-800 py-1 font-mono truncate" 
                                placeholder="https://..." 
                                value={theme.coverImage || ''} 
                                onChange={e => {
                                       const newThemes = [...localThemes]; newThemes[idx] = {...newThemes[idx], coverImage: e.target.value}; setLocalThemes(newThemes);
                                }} 
                             />
                          </div>

                          <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-[10px] uppercase text-stone-400 mb-1">Title (EN)</label>
                                      <input className="w-full bg-stone-50 dark:bg-ink-950 p-2 border border-stone-200 dark:border-ink-800" value={theme.title.en} onChange={e => {
                                          const newThemes = [...localThemes]; newThemes[idx] = {...newThemes[idx], title: {...newThemes[idx].title, en: e.target.value}}; setLocalThemes(newThemes);
                                      }} />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] uppercase text-stone-400 mb-1">Title (ZH)</label>
                                      <input className="w-full bg-stone-50 dark:bg-ink-950 p-2 border border-stone-200 dark:border-ink-800" value={theme.title.zh} onChange={e => {
                                           const newThemes = [...localThemes]; newThemes[idx] = {...newThemes[idx], title: {...newThemes[idx].title, zh: e.target.value}}; setLocalThemes(newThemes);
                                      }} />
                                  </div>
                              </div>
                              
                              {/* Hypothesis - Bilingual Update */}
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-[10px] uppercase text-stone-400 mb-1">Hypothesis (EN)</label>
                                      <input className="w-full bg-stone-50 dark:bg-ink-950 p-2 border border-stone-200 dark:border-ink-800 font-serif italic" value={theme.hypothesis.en} onChange={e => {
                                          const newThemes = [...localThemes]; newThemes[idx] = {...newThemes[idx], hypothesis: {...newThemes[idx].hypothesis, en: e.target.value}}; setLocalThemes(newThemes);
                                      }} />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] uppercase text-stone-400 mb-1">Hypothesis (ZH)</label>
                                      <input className="w-full bg-stone-50 dark:bg-ink-950 p-2 border border-stone-200 dark:border-ink-800 font-serif italic" value={theme.hypothesis.zh} onChange={e => {
                                          const newThemes = [...localThemes]; newThemes[idx] = {...newThemes[idx], hypothesis: {...newThemes[idx].hypothesis, zh: e.target.value}}; setLocalThemes(newThemes);
                                      }} />
                                  </div>
                              </div>

                              <div className="flex gap-4 items-center">
                                  <div className="w-full">
                                    <label className="block text-[10px] uppercase text-stone-400 mb-1">Status</label>
                                    <select value={theme.status} onChange={e => {
                                        const newThemes = [...localThemes]; newThemes[idx] = {...newThemes[idx], status: e.target.value as any}; setLocalThemes(newThemes);
                                    }} className="w-full bg-stone-50 dark:bg-ink-950 p-2 border border-stone-200 dark:border-ink-800 text-xs uppercase">
                                        <option value="Exploring">Exploring</option><option value="Active">Active</option><option value="Stabilizing">Stabilizing</option><option value="Archived">Archived</option>
                                    </select>
                                  </div>
                              </div>
                          </div>
                           <button onClick={() => setLocalThemes(localThemes.filter(t => t.id !== theme.id))} className="absolute top-4 right-4 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                      </div>
                  ))}
              </div>
          </main>
      )}

      {/* --- SPECULATIVE NOTES --- */}
      {activeTab === 'speculative' && (
          <main className="flex-1 p-12 overflow-y-auto bg-stone-50 dark:bg-ink-950">
              <div className="flex justify-between items-baseline mb-8">
                  <h1 className="text-3xl font-serif text-stone-900 dark:text-stone-100">Speculative Notes</h1>
                  <button onClick={() => {
                      const newNote: SpeculativeItem = {
                          id: `note-${Date.now()}`, date: new Date().toISOString().split('T')[0],
                          text: { en: 'New thought...', zh: '新想法...' }
                      };
                      setLocalSpeculative([newNote, ...localSpeculative]);
                  }} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"><Plus size={14}/> Add Note</button>
              </div>
              <div className="space-y-4 max-w-2xl">
                  {localSpeculative.map((note, idx) => (
                      <div key={note.id} className="bg-white dark:bg-ink-900 p-6 border border-stone-200 dark:border-ink-800 rounded-sm relative group">
                          <button onClick={() => setLocalSpeculative(localSpeculative.filter(n => n.id !== note.id))} className="absolute top-4 right-4 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                          <div className="mb-2 text-[10px] font-mono text-stone-400">{note.date}</div>
                          <textarea className="w-full bg-transparent outline-none resize-none mb-2 text-sm text-stone-800 dark:text-stone-200" rows={2} value={note.text.en} onChange={e => {
                               const newSpecs = [...localSpeculative]; newSpecs[idx] = {...newSpecs[idx], text: {...newSpecs[idx].text, en: e.target.value}}; setLocalSpeculative(newSpecs);
                          }} />
                          <div className="w-full h-px bg-stone-100 dark:bg-ink-800 my-2"></div>
                          <textarea className="w-full bg-transparent outline-none resize-none text-sm text-stone-600 dark:text-stone-400" rows={2} value={note.text.zh} onChange={e => {
                               const newSpecs = [...localSpeculative]; newSpecs[idx] = {...newSpecs[idx], text: {...newSpecs[idx].text, zh: e.target.value}}; setLocalSpeculative(newSpecs);
                          }} />
                      </div>
                  ))}
              </div>
          </main>
      )}

    </div>
  );
};

export default Admin;
