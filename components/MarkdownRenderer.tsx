
import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import { Link } from 'react-router-dom';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const CodeBlock = ({ className, children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match && !String(children).includes('\n');
    
    // Extract text content for copying
    const textContent = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(textContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isInline) {
        return (
            <code className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-1.5 py-0.5 rounded text-sm font-mono border border-stone-200 dark:border-stone-700 mx-1" {...props}>
                {children}
            </code>
        );
    }

    return (
        <div className="my-6 rounded-sm overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d1117] relative group">
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900/50">
                <span className="text-[10px] uppercase font-mono text-stone-400">{match ? match[1] : 'code'}</span>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={handleCopy} 
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1"
                        title="Copy code"
                     >
                        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                     </button>
                    <div className="flex gap-1.5 ml-2">
                        <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700"></div>
                        <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700"></div>
                    </div>
                </div>
            </div>
            <div className="p-4 overflow-x-auto">
                <code className={`${className} text-sm font-mono leading-relaxed text-stone-800 dark:text-stone-300`} {...props}>
                    {children}
                </code>
            </div>
        </div>
    );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  
  // Pre-process content for WikiLinks [[slug]] -> [slug](/articles/slug)
  // And [[slug|text]] -> [text](/articles/slug)
  const processedContent = useMemo(() => {
    let text = content;
    // Handle aliased links [[slug|Text]]
    text = text.replace(/\[\[(.*?)\|(.*?)\]\]/g, "[$2](/articles/$1)");
    // Handle standard links [[slug]]
    text = text.replace(/\[\[(.*?)\]\]/g, "[$1](/articles/$1)");
    return text;
  }, [content]);

  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeSlug]}
        components={{
            // Custom Paragraph to handle spacing
            p: ({node, children}) => <p className="mb-6 leading-relaxed text-stone-700 dark:text-stone-300">{children}</p>,
            
            // Headings
            h1: ({node, children, ...props}) => <h1 id={props.id} className="text-3xl font-bold font-serif mt-12 mb-6 text-stone-900 dark:text-stone-100 group flex items-center gap-2">{children}</h1>,
            h2: ({node, children, ...props}) => <h2 id={props.id} className="text-2xl font-bold font-serif mt-12 mb-6 pb-2 border-b border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 scroll-mt-24">{children}</h2>,
            h3: ({node, children, ...props}) => <h3 id={props.id} className="text-xl font-bold font-serif mt-8 mb-4 text-stone-900 dark:text-stone-100 scroll-mt-24">{children}</h3>,
            
            // Lists
            ul: ({node, children}) => <ul className="list-disc ml-6 mb-6 text-stone-700 dark:text-stone-300 marker:text-stone-400">{children}</ul>,
            ol: ({node, children}) => <ol className="list-decimal ml-6 mb-6 text-stone-700 dark:text-stone-300 marker:text-stone-400">{children}</ol>,
            li: ({node, children}) => <li className="pl-2 mb-2">{children}</li>,
            
            // Blockquotes (Academic Citation Style)
            blockquote: ({node, children}) => (
                <blockquote className="border-l-4 border-stone-300 dark:border-stone-600 pl-4 py-2 my-8 bg-stone-50 dark:bg-stone-900/50 italic text-stone-600 dark:text-stone-400">
                    {children}
                </blockquote>
            ),

            // Use extracted CodeBlock component
            code: CodeBlock,
            
            // Images (Enhanced Figure)
            img: ({node, src, alt, title}) => (
                <figure className="my-10">
                    <img 
                        src={src} 
                        alt={alt} 
                        className="w-full h-auto border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 rounded-sm"
                    />
                    {(alt || title) && (
                        <figcaption className="text-center text-xs text-stone-400 dark:text-stone-500 mt-3 font-mono">
                            Figure: {title || alt}
                        </figcaption>
                    )}
                </figure>
            ),
            
            // Links
            a: ({node, href, children}) => {
                if (href?.startsWith('/')) {
                    return <Link to={href} className="text-stone-900 dark:text-stone-100 underline decoration-stone-300 dark:decoration-stone-600 underline-offset-4 hover:decoration-stone-500 dark:hover:decoration-stone-400 transition-colors font-medium">{children}</Link>;
                }
                // Handle footnotes
                if (href?.startsWith('#user-content-fn')) {
                    return <a href={href} className="text-xs text-stone-500 dark:text-stone-400 no-underline bg-stone-100 dark:bg-stone-800 px-1 rounded-sm mx-0.5 align-top hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">{children}</a>
                }
                return <a href={href} target="_blank" rel="noopener noreferrer" className="text-stone-900 dark:text-stone-100 underline decoration-stone-300 dark:decoration-stone-600 underline-offset-4 hover:decoration-stone-500 dark:hover:decoration-stone-400 transition-colors font-medium">{children}</a>;
            },
            
            // Tables
            table: ({node, children}) => (
                <div className="overflow-x-auto my-8 border border-stone-200 dark:border-stone-800 rounded-sm">
                    <table className="w-full text-sm text-left text-stone-600 dark:text-stone-400 font-mono">
                        {children}
                    </table>
                </div>
            ),
            thead: ({node, children}) => <thead className="bg-stone-50 dark:bg-stone-900 text-xs uppercase text-stone-500 dark:text-stone-400">{children}</thead>,
            th: ({node, children}) => <th className="px-6 py-3 font-medium tracking-wider">{children}</th>,
            td: ({node, children}) => <td className="px-6 py-4 border-t border-stone-100 dark:border-stone-800">{children}</td>,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
