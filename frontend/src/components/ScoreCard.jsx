import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { ChevronDown } from 'lucide-react';

export default function ScoreCard({ scores, className }) {
  const [expandedKey, setExpandedKey] = useState(null);

  if (!scores) return null;
  
  const metrics = [
    { key: 'BQ', label: 'Business Quality' },
    { key: 'CY', label: 'Cyclicality' }, 
    { key: 'RP', label: 'Return Profile' }, 
    { key: 'BG', label: 'Business Governance' } 
  ];

  const toggleExpand = (key) => {
    setExpandedKey(prev => prev === key ? null : key);
  };

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {metrics.map(m => {
        const data = scores[m.key]; 
        if (!data || data.val === null || data.val === undefined) return null;
        
        const isExpanded = expandedKey === m.key;
        // Ensure reasoning points is treated as an array
        const reasoningPoints = Array.isArray(data.justification) ? data.justification : [];

        return (
          <div 
            key={m.key} 
            onClick={() => toggleExpand(m.key)}
            className="bg-gradient-to-br from-insight-card to-[#1a1a2e] rounded-xl border border-gray-800 shadow-lg flex flex-col items-center p-4 cursor-pointer hover:border-insight-blue/50 transition-all duration-300 relative overflow-hidden"
          >
            {/* Main Score Display */}
            <div className="flex flex-col items-center justify-center w-full">
              <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-insight-blue to-insight-purple">
                {data.val}
              </span>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-gray-400 font-semibold tracking-wider">{m.key} Score</span>
                <ChevronDown 
                  size={14} 
                  className={`text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </div>
            </div>

            {/* Expandable Justification Section (Using your reasoning_points array) */}
            <div 
              className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="pt-3 border-t border-gray-800 w-full text-left">
                {reasoningPoints.length > 0 ? (
                  <ul className="text-xs text-gray-300 leading-relaxed space-y-2 list-disc pl-4">
                    {reasoningPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 text-center">No reasoning points available.</p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}