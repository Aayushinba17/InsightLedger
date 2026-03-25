import React from 'react';
import { cn } from '../utils/cn';

export default function ScoreCard({ scores, className }) {
  // scores = { BQ: 80, CY: 75, RP: 90, BG: 85 } or similar
  if (!scores) return null;
  
  const metrics = [
    { key: 'BQ', label: 'Business Quality' },
    { key: 'CY', label: 'Company Yield' },
    { key: 'RP', label: 'Relative Price' },
    { key: 'BG', label: 'Business Growth' }
  ];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {metrics.map(m => {
        const val = scores[m.key];
        if (val === null || val === undefined) return null;
        return (
          <div key={m.key} className="bg-gradient-to-br from-insight-card to-[#1a1a2e] p-4 rounded-xl border border-gray-800 shadow-lg flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-insight-blue to-insight-purple">
              {val}
            </span>
            <span className="text-xs text-gray-400 font-semibold tracking-wider mt-2">{m.key} Score</span>
          </div>
        )
      })}
    </div>
  );
}
