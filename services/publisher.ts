
import { Draft, ContentType } from '../types';

/**
 * PublisherService
 * Handles the conversion of Draft objects to Markdown with Front Matter
 * and manages the transmission to the backend proxy.
 */

// Generate YAML Front Matter
const generateMarkdown = (draft: Draft, lang: 'zh' | 'en'): string => {
  const isZh = lang === 'zh';
  const content = isZh ? draft.contentZh : draft.contentEn;
  
  // We use a unified Front Matter structure.
  return `---
slug: ${draft.slug}
title: ${draft.titleZh}
title_en: ${draft.titleEn}
date: ${new Date().toISOString().split('T')[0]}
type: ${draft.type}
theme: ${draft.themeId}
draft: ${draft.isDraft}
lang: ${lang}
abstract: "${isZh ? draft.abstractZh : draft.abstractEn}"
---

${content}
`;
};

export const commitResearch = async (draft: Draft, token: string): Promise<{ success: boolean; message: string }> => {
  try {
    // 1. Prepare Files
    // We place content in a 'content' folder at the root of the repo
    const contentZh = generateMarkdown(draft, 'zh');
    const contentEn = generateMarkdown(draft, 'en');

    // Define file paths. 
    // Example: content/articles/dynamic-sparsity.zh.md
    const folder = draft.type === ContentType.PROJECT ? 'projects' : 'articles';
    const pathZh = `content/${folder}/${draft.slug}.zh.md`;
    const pathEn = `content/${folder}/${draft.slug}.en.md`;

    // 2. Send to Server-Side Proxy (Vercel API)
    // The 'token' passed here is the Access Key entered in the UI.
    const response = await fetch('/api/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessKey: token, 
        files: [
            { path: pathZh, content: contentZh },
            { path: pathEn, content: contentEn }
        ],
        message: `research(log): ${draft.titleEn} [web-commit]` 
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Commit failed');
    }
    
    return { success: true, message: `Successfully committed: ${draft.slug}` };

  } catch (error) {
    console.error(error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
};
