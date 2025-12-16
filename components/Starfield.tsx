import React, { useMemo } from 'react';

// Generates a static random set of stars to avoid hydration mismatch or expensive re-renders
const generateStars = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() < 0.6 ? '1px' : '1.5px', // Smaller stars
    opacity: Math.random() * 0.25 + 0.05, // Very low opacity (0.05 - 0.3)
  }));
};

export const Starfield: React.FC = () => {
  const stars = useMemo(() => generateStars(80), []); // Slightly increased count, but lower visibility

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Container drifts slowly upward to simulate time passing */}
      <div className="w-full h-[120%] animate-star-drift">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-stone-400 dark:bg-stone-600 rounded-full mix-blend-screen"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
};