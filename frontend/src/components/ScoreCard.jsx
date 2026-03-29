import React, { useState } from 'react';
import { cn } from '../utils/cn';

export default function ScoreCard({ scores, className }) {
  const [expandedKey, setExpandedKey] = useState(null);

  if (!scores) return null;

  const metrics = [
    { key: 'BQ', label: 'Business Quality', desc: 'Moat, pricing power, scalability' },
    { key: 'RP', label: 'Return Profile', desc: 'ROE, ROCE, capital efficiency' },
    { key: 'CY', label: 'Cyclicality', desc: 'Revenue stability, demand sensitivity' },
    { key: 'BG', label: 'Governance', desc: 'Management quality, transparency' }
  ];

  const toggleExpand = (key) => {
    setExpandedKey(prev => prev === key ? null : key);
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 items-start", className)}>
      {metrics.map(m => {
        const data = scores[m.key];
        if (!data) return null;

        const isExpanded = expandedKey === m.key;
        const reasoningPoints = Array.isArray(data.justification) ? data.justification : [];

        return (
          <div
            key={m.key}
            // CHANGED: Removed overflow-hidden so the dropdown can float outside!
            className="bg-insight-card border border-insight-border rounded-2xl p-6 transition-all duration-300 hover:border-insight-blue/40 shadow-sm relative overflow-visible h-fit flex flex-col"
          >
            {/* Header row */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-insight-blue/10 text-insight-blue border border-insight-blue/20 px-2 py-0.5 rounded text-xs font-black tracking-wider shadow-inner">
                    {m.key}
                  </span>
                  <h3 className="text-lg font-bold text-insight-text tracking-tight">{m.label}</h3>
                </div>
                <p className="text-xs text-insight-muted font-medium">{m.desc}</p>
              </div>
              
              {/* High contrast score */}
              <div className="text-5xl font-black text-white tracking-tighter drop-shadow-md">
                {data.val !== null && data.val !== undefined ? data.val : '—'}
              </div>
            </div>

            {/* Toggle button */}
            <button
              onClick={() => toggleExpand(m.key)}
              className="flex items-center gap-2 text-xs font-semibold text-insight-muted hover:text-insight-blue transition-colors mt-6 w-full text-left uppercase tracking-widest"
            >
              {isExpanded ? 'Hide Reasoning' : 'View Reasoning'}
              <span className={`transition-transform duration-300 text-[10px] ${isExpanded ? 'rotate-180 text-insight-blue' : ''}`}>
                ▼
              </span>
            </button>

            {/* TRUE DROPDOWN FIX: 
              This is now absolutely positioned (absolute left-0 right-0 top-full mt-2).
              It floats cleanly OVER the rest of the page with a sleek shadow. 
              No weird empty left gaps!
            */}
            {isExpanded && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-insight-deep border border-insight-border rounded-xl shadow-2xl p-5 shadow-black/60 animate-in fade-in slide-in-from-top-2 duration-200">
                {reasoningPoints.length > 0 ? (
                  <ul className="text-sm text-insight-text leading-relaxed space-y-2.5 list-none m-0 p-0">
                    {reasoningPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-insight-blue text-lg leading-none shrink-0 drop-shadow-md mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-insight-muted italic m-0">No reasoning points available.</p>
                )}
              </div>
            )}
            
          </div>
        );
      })}
    </div>
  );
}