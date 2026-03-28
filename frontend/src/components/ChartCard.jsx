// import React from 'react';
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer
// } from 'recharts';
// import { cn } from '../utils/cn';

// export default function ChartCard({ data, className }) {
//   if (!data || data.length === 0) return null;

//   return (
//     <div className={cn("w-full max-w-5xl mx-auto bg-insight-card p-6 rounded-2xl border border-gray-800 shadow-lg", className)}>
//       <div className="h-80 w-full mt-4">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart
//             data={data}
//             margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
//           >
//             <defs>
//               <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
//                 <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
//             <XAxis dataKey="date" stroke="#888" tick={{fill: '#888', fontSize: 12}} tickLine={false} axisLine={false} />
//             <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} tickLine={false} axisLine={false} />
//             <Tooltip 
//               contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
//               itemStyle={{ color: '#fff' }}
//             />
//             <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }



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

// --- CUSTOM HIGH-END TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = parseFloat(payload[0].value);
    const isPositive = value >= 0;
    
    return (
      <div className="bg-[#12121e]/80 backdrop-blur-md border border-gray-700/50 p-4 rounded-xl shadow-2xl">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-bold">{label} Return</p>
        <p className={`text-3xl font-extrabold ${isPositive ? 'text-white' : 'text-red-100'}`}>
          {isPositive ? '+' : ''}{value.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function ChartCard({ data, className }) {
  if (!data || data.length === 0) return null;

  return (
    <div className={cn("w-full bg-insight-card p-6 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden", className)}>
      
      {/* Subtle background glow effect */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-insight-blue/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="h-72 w-full mt-2 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 15, left: -20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            {/* Softened grid lines */}
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
            
            <XAxis 
              dataKey="date" 
              stroke="#555" 
              tick={{ fill: '#888', fontSize: 13, fontWeight: 600 }} 
              tickLine={false} 
              axisLine={false} 
              dy={15} // Pushes labels down slightly so they don't clip
            />
            
            <YAxis 
              stroke="#555" 
              tick={{ fill: '#888', fontSize: 12, fontWeight: 500 }} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(tick) => `${tick}%`} // Adds % sign to Y-Axis
              dx={-10}
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#444', strokeWidth: 1, strokeDasharray: '4 4' }} 
            />
            
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={4} // Thicker, bolder line
              fillOpacity={1} 
              fill="url(#colorValue)" 
              // Add dots to make the 3 data points obvious
              dot={{ r: 5, fill: '#1e1e2f', stroke: '#3b82f6', strokeWidth: 2 }}
              // Add a glowing hover effect on the dots
              activeDot={{ r: 8, fill: '#fff', stroke: '#3b82f6', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}