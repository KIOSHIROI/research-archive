
import { Draft, ContentType } from '../types';

/**
 * PublisherService
 * Handles the conversion of Draft objects to Markdown with Front Matter
 * and manages the transmission to the backend proxy.
 */

// Helper to escape strings for YAML to prevent syntax errors
const escapeYaml = (str: string): string => {
  return str.replace(/"/g, '\\"');
};

// Generate YAML Front Matter
const generateMarkdown = (draft: Draft, lang: 'zh' | 'en'): string => {
  const isZh = lang === 'zh';
  const content = isZh ? draft.contentZh : draft.contentEn;
  const title = isZh ? draft.titleZh : draft.titleEn;
  const abstract = isZh ? draft.abstractZh : draft.abstractEn;
  
  // We use a unified Front Matter structure.
  return `---
slug: "${escapeYaml(draft.slug)}"
title: "${escapeYaml(title)}"
title_en: "${escapeYaml(draft.titleEn)}"
date: ${new Date().toISOString().split('T')[0]}
type: ${draft.type}
theme: ${draft.themeId}
draft: ${draft.isDraft}
lang: ${lang}
abstract: "${escapeYaml(abstract)}"
---

${content}
`;
};

// New parameter: indexContent (optional JSON string of all content)
export const commitResearch = async (draft: Draft, token: string, indexContent?: string): Promise<{ success: boolean; message: string }> => {
  try {
    // 1. Prepare Files
    const contentZh = generateMarkdown(draft, 'zh');
    const contentEn = generateMarkdown(draft, 'en');

    const folder = draft.type === ContentType.PROJECT ? 'projects' : 'articles';
    const pathZh = `content/${folder}/${draft.slug}.zh.md`;
    const pathEn = `content/${folder}/${draft.slug}.en.md`;

    const filesToCommit = [
        { path: pathZh, content: contentZh },
        { path: pathEn, content: contentEn }
    ];

    // If an index update is provided, add it to the commit payload
    if (indexContent) {
        filesToCommit.push({
            path: 'public/content.json',
            content: indexContent
        });
    }

    // 2. Send to Server-Side Proxy (Vercel API)
    const response = await fetch('/api/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessKey: token, 
        files: filesToCommit,
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
