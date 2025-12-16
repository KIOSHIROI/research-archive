
export enum ContentType {
  ARTICLE = 'ARTICLE',
  PROJECT = 'PROJECT',
}

export type LocalizedString = {
  en: string;
  zh: string;
};

export interface Education {
  school: LocalizedString;
  department: LocalizedString;
  major: LocalizedString;
  stage: LocalizedString; // e.g. "Bachelor's Stage", "Prospective Master's"
}

export interface Author {
  name: LocalizedString;
  role: LocalizedString;
  affiliation: LocalizedString;
  email: string;
  github?: string;
  scholar?: string;
  bio: LocalizedString;
  avatar?: string; // Profile photo URL
  resumeUrl?: string; // NEW: Link to resume/CV
  education: Education[];
}

export type ResearchStatus = 'Exploring' | 'Active' | 'Stabilizing' | 'Archived';

export interface ResearchTheme {
  id: string;
  title: LocalizedString;
  description: LocalizedString; // The "Abstract" of the theme
  hypothesis: LocalizedString; // The core research question
  status: ResearchStatus;
  order: number;
  coverImage?: string; // URL for a generated abstract image
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: LocalizedString;
  abstract: LocalizedString;
  date: string; // ISO string
  themeId: string;
  slug: string;
  content: LocalizedString; // Markdown-like structure
  coverImage?: string;
  isDraft?: boolean; // Track draft status in the index
  metadata?: {
    journal?: string;
    repoUrl?: string;
    techStack?: string[];
    coAuthors?: string[];
  };
}

export interface SpeculativeItem {
  id: string;
  date: string;
  text: LocalizedString;
}

export interface SpeculativeCollection {
    title: LocalizedString;
    items: SpeculativeItem[];
}

// Global Content Index Structure (content.json)
export interface GlobalContentIndex {
    author: Author; // NEW: Dynamic Author Profile
    themes: ResearchTheme[];
    content: ContentItem[];
    speculative: SpeculativeCollection;
}

// New Type for the Admin Interface
export interface Draft {
  slug: string;
  titleZh: string;
  titleEn: string;
  type: ContentType;
  themeId: string;
  abstractZh: string;
  abstractEn: string;
  contentZh: string;
  contentEn: string;
  isDraft: boolean;
}
