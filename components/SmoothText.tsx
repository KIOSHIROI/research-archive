import React, { useState, useEffect } from 'react';

interface SmoothTextProps {
  children: React.ReactNode; 
  className?: string;
  as?: React.ElementType;
  stagger?: number; // Delay in ms before starting the transition
  duration?: number; // Duration of the fade
}

/**
 * SmoothText (Bilingual Glide Edition)
 * 
 * Implements a "Smooth Contextual Glide" for language switching.
 * Uses a Double Buffer strategy within a Grid layout to layer
 * the outgoing and incoming text, ensuring:
 * 1. No layout jumps (Container takes max height of both)
 * 2. Gentle crossfade (Overlap of outgoing/incoming)
 * 3. Consistent typography metrics
 */
export const SmoothText: React.FC<SmoothTextProps> = ({ 
  children, 
  className = '', 
  as: Tag = 'span',
  stagger = 0,
  duration = 600 // Slower for that "glide" feel
}) => {
  // We maintain two buffers (A and B) to hold content.
  // 'active' points to the buffer that currently holds the target content.
  const [activeBuffer, setActiveBuffer] = useState<'A' | 'B'>('A');
  const [bufferA, setBufferA] = useState<React.ReactNode>(children);
  const [bufferB, setBufferB] = useState<React.ReactNode>(null);

  useEffect(() => {
    // If the content passed in (children) matches what's in the active buffer, do nothing.
    const currentContent = activeBuffer === 'A' ? bufferA : bufferB;
    
    if (children !== currentContent) {
      // Trigger Switch Sequence
      const timer = setTimeout(() => {
        if (activeBuffer === 'A') {
          // Switch to B
          setBufferB(children);
          setActiveBuffer('B');
        } else {
          // Switch to A
          setBufferA(children);
          setActiveBuffer('A');
        }
      }, stagger);

      return () => clearTimeout(timer);
    }
  }, [children, activeBuffer, bufferA, bufferB, stagger]);

  // Determine display mode based on Tag
  const displayStyle = Tag === 'span' ? 'inline-grid' : 'grid';

  return (
    <Tag 
      className={`${className} relative`}
      style={{ 
        display: displayStyle, 
        gridTemplateAreas: '"content"',
        // Alignment 'baseline' is crucial for inline text to align with surrounding text
        alignItems: 'baseline' 
      }}
    >
      {/* Buffer A */}
      <span 
        aria-hidden={activeBuffer !== 'A'}
        style={{ 
          gridArea: 'content',
          opacity: activeBuffer === 'A' ? 1 : 0,
          transition: `opacity ${duration}ms ease-in-out`,
          pointerEvents: activeBuffer === 'A' ? 'auto' : 'none'
        }}
        className="row-start-1 col-start-1"
      >
        {bufferA}
      </span>

      {/* Buffer B */}
      <span 
        aria-hidden={activeBuffer !== 'B'}
        style={{ 
          gridArea: 'content',
          opacity: activeBuffer === 'B' ? 1 : 0,
          transition: `opacity ${duration}ms ease-in-out`,
          pointerEvents: activeBuffer === 'B' ? 'auto' : 'none'
        }}
        className="row-start-1 col-start-1"
      >
        {bufferB}
      </span>
    </Tag>
  );
};

export const SmoothBlock: React.FC<SmoothTextProps> = (props) => {
  return <SmoothText as="div" {...props} />;
};
