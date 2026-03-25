import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '../utils/cn';

export default function ChartCard({ data, className }) {
  if (!data || data.length === 0) return null;

  return (
    <div className={cn("w-full max-w-5xl mx-auto bg-insight-card p-6 rounded-2xl border border-gray-800 shadow-lg", className)}>
      <div className="h-80 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="date" stroke="#888" tick={{fill: '#888', fontSize: 12}} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
