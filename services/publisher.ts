
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
  
  // Convert comma-separated tech stack back to array format for YAML
  const techStackArray = draft.techStack
    ? draft.techStack.split(',').map(s => `"${s.trim()}"`).join(', ')
    : '';
  
  // We use a unified Front Matter structure.
  let yaml = `---
slug: "${escapeYaml(draft.slug)}"
title: "${escapeYaml(title)}"
title_en: "${escapeYaml(draft.titleEn)}"
date: ${new Date().toISOString().split('T')[0]}
type: ${draft.type}
theme: ${draft.themeId}
draft: ${draft.isDraft}
lang: ${lang}
abstract: "${escapeYaml(abstract)}"
`;

  // Append Metadata Block if exists
  if (draft.journal || draft.repoUrl || draft.techStack || draft.notionUrl) {
      yaml += `metadata:\n`;
      if (draft.journal) yaml += `  journal: "${escapeYaml(draft.journal)}"\n`;
      if (draft.repoUrl) yaml += `  repoUrl: "${escapeYaml(draft.repoUrl)}"\n`;
      if (draft.notionUrl) yaml += `  notionUrl: "${escapeYaml(draft.notionUrl)}"\n`;
      if (techStackArray) yaml += `  techStack: [${techStackArray}]\n`;
  }

  yaml += `---\n\n${content}`;

  return yaml;
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
