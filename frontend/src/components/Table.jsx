import React from 'react';
import { cn } from '../utils/cn';
import TagBadge from './TagBadge';

export default function Table({ data, className }) {
  if (!data || data.length === 0) return null;

  const hasScore = data.some(d => d.score !== undefined && d.score !== null);
  const hasVal = data.some(d => d.val !== undefined && d.val !== null);
  const hasGro = data.some(d => d.gro !== undefined && d.gro !== null);
  const hasSaf = data.some(d => d.saf !== undefined && d.saf !== null);
  const hasBQ = data.some(d => d.bq !== undefined && d.bq !== null);
  const hasCY = data.some(d => d.cy !== undefined && d.cy !== null);
  const hasRP = data.some(d => d.rp !== undefined && d.rp !== null);
  const hasBG = data.some(d => d.bg !== undefined && d.bg !== null);

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-gray-800 bg-insight-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#1a1a2e] text-xs uppercase text-gray-400 border-b border-gray-800">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Company Name</th>
              <th scope="col" className="px-6 py-4 font-semibold">Year</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              {hasScore && <th scope="col" className="px-6 py-4 font-semibold">Score</th>}
              {hasVal && <th scope="col" className="px-6 py-4 font-semibold text-center">Value</th>}
              {hasGro && <th scope="col" className="px-6 py-4 font-semibold text-center">Growth</th>}
              {hasSaf && <th scope="col" className="px-6 py-4 font-semibold text-center">Safety</th>}
              {hasBQ && <th scope="col" className="px-6 py-4 font-semibold text-center">BQ</th>}
              {hasCY && <th scope="col" className="px-6 py-4 font-semibold text-center">CY</th>}
              {hasRP && <th scope="col" className="px-6 py-4 font-semibold text-center">RP</th>}
              {hasBG && <th scope="col" className="px-6 py-4 font-semibold text-center">BG</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr 
                key={idx} 
                className="border-b border-gray-800 hover:bg-gray-800/80 cursor-pointer transition-colors duration-200"
                onClick={() => window.open(`/company/${row.name}`, '_blank')}
              >
                <td className="px-6 py-4 font-medium text-gray-100">{row.name}</td>
                <td className="px-6 py-4">{row.year}</td>
                <td className="px-6 py-4">
                  <TagBadge label={row.status} />
                </td>
                {hasScore && (
                  <td className="px-6 py-4">{row.score !== null && row.score !== undefined ? Number(row.score).toFixed(4) : 'N/A'}</td>
                )}
                {hasVal && (
                  <td className="px-6 py-4 text-center">{row.val !== null && row.val !== undefined ? Number(row.val).toFixed(4) : 'N/A'}</td>
                )}
                {hasGro && (
                  <td className="px-6 py-4 text-center">{row.gro !== null && row.gro !== undefined ? Number(row.gro).toFixed(4) : 'N/A'}</td>
                )}
                {hasSaf && (
                  <td className="px-6 py-4 text-center">{row.saf !== null && row.saf !== undefined ? Number(row.saf).toFixed(4) : 'N/A'}</td>
                )}
                {hasBQ && (
                  <td className="px-6 py-4 text-center">{row.bq !== null && row.bq !== undefined ? Number(row.bq).toFixed(2) : 'N/A'}</td>
                )}
                {hasCY && (
                  <td className="px-6 py-4 text-center">{row.cy !== null && row.cy !== undefined ? Number(row.cy).toFixed(2) : 'N/A'}</td>
                )}
                {hasRP && (
                  <td className="px-6 py-4 text-center">{row.rp !== null && row.rp !== undefined ? Number(row.rp).toFixed(2) : 'N/A'}</td>
                )}
                {hasBG && (
                  <td className="px-6 py-4 text-center">{row.bg !== null && row.bg !== undefined ? Number(row.bg).toFixed(2) : 'N/A'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
