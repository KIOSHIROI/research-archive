
import React, { useMemo } from 'react';
import { useAllContent, useSpeculative } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';

export const ActivityHeatmap: React.FC = () => {
  const content = useAllContent();
  const speculative = useSpeculative();
  const { lang } = useLanguage();

  // 1. Generate last 365 days dates
  const calendarData = useMemo(() => {
    const today = new Date();
    const days = [];
    // Go back 52 weeks * 7 days
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (52 * 7) + (today.getDay() + 1)); // Align to week start

    for (let i = 0; i < 364; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        
        // Count contributions
        let count = 0;
        // Check content
        content.forEach(c => {
            if (c.date === dateStr) count += 3; // Article = High intensity
        });
        // Check speculative notes
        speculative.items.forEach(s => {
            if (s.date === dateStr) count += 1; // Note = Low intensity
        });

        days.push({ date: dateStr, count });
    }
    return days;
  }, [content, speculative]);

  const getColor = (count: number) => {
      if (count === 0) return 'bg-stone-200 dark:bg-stone-800/50';
      if (count === 1) return 'bg-stone-300 dark:bg-stone-700';
      if (count <= 3) return 'bg-stone-400 dark:bg-stone-600';
      return 'bg-stone-600 dark:bg-stone-400';
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
       <div className="min-w-[600px]">
         <div className="flex gap-1">
             {/* Simple grid rendering: 52 columns, 7 rows logic is implicit in flex-wrap vertical or css grid. 
                 Since mapping linear array, let's use CSS Grid. */}
             <div className="grid grid-rows-7 grid-flow-col gap-1 w-full">
                 {calendarData.map((day) => (
                     <div 
                        key={day.date} 
                        className={`w-2 h-2 rounded-sm ${getColor(day.count)}`}
                        title={`${day.date}: ${day.count > 0 ? 'Active' : 'No public activity'}`}
                     ></div>
                 ))}
             </div>
         </div>
         <div className="flex justify-between mt-2 text-[10px] font-mono text-stone-400 dark:text-stone-600 uppercase tracking-widest">
             <span>{lang === 'en' ? '1 Year Ago' : '一年前'}</span>
             <div className="flex items-center gap-1">
                 <span>Less</span>
                 <div className="w-2 h-2 bg-stone-200 dark:bg-stone-800/50 rounded-sm"></div>
                 <div className="w-2 h-2 bg-stone-300 dark:bg-stone-700 rounded-sm"></div>
                 <div className="w-2 h-2 bg-stone-400 dark:bg-stone-600 rounded-sm"></div>
                 <div className="w-2 h-2 bg-stone-600 dark:bg-stone-400 rounded-sm"></div>
                 <span>More</span>
             </div>
             <span>{lang === 'en' ? 'Today' : '今日'}</span>
         </div>
       </div>
    </div>
  );
};
