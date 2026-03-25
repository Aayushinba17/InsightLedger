import React from 'react';
import { cn } from '../utils/cn';
import TagBadge from './TagBadge';

export default function Table({ data, className }) {
  if (!data || data.length === 0) return null;

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-gray-800 bg-insight-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#1a1a2e] text-xs uppercase text-gray-400 border-b border-gray-800">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Company Name</th>
              <th scope="col" className="px-6 py-4 font-semibold">Year</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr 
                key={idx} 
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-100">{row.name}</td>
                <td className="px-6 py-4">{row.year}</td>
                <td className="px-6 py-4">
                  <TagBadge label={row.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {row.fileLink ? (
                    <a href={row.fileLink} target="_blank" rel="noreferrer" className="text-insight-blue hover:text-insight-purple transition-colors flex items-center justify-end gap-1">
                      View PDF
                    </a>
                  ) : (
                    <span className="text-gray-600">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
