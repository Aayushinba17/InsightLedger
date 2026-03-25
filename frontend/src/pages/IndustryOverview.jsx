import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchIndustrySummary } from '../utils/dataFetcher';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
  '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#0ea5e9'
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#12121e] border border-gray-700 p-3 rounded-lg shadow-2xl">
        <p className="text-gray-100 font-bold mb-1">{(label || '').replace(/_/g, ' ')}</p>
        <p className="text-insight-purple font-semibold text-sm">
          Overall Score: <span className="text-white ml-1">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function IndustryOverview() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIndustrySummary()
      .then(res => {
        const arr = res.rankings || [];
        arr.sort((a, b) => (a.rank || 0) - (b.rank || 0));
        setData(arr);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Industries...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
      <div className="flex items-center mb-2">
        <Link to="/" className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-2">Industry Overview</h1>
        <p className="text-gray-400">Ranking and performance summary of all industries</p>
      </header>

      {data.length > 0 && (
        <section className="bg-insight-card p-6 rounded-2xl border border-gray-800 mb-8 shadow-lg">
          <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-6">Industry Scores</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="industry" stroke="#666" tick={{fill: '#888', fontSize: 11}} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" tick={{fill: '#888', fontSize: 11}} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#2a2a3a'}}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="overall_score" 
                  radius={[4, 4, 0, 0]}
                  onClick={(entry) => {
                    if (entry && entry.industry) {
                      navigate(`/industry/${encodeURIComponent(entry.industry)}`);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {data.map((entry, index) => (
                     <Cell 
                       key={`cell-${index}`} 
                       fill="url(#colorBrand)" 
                       opacity={1 - (index / data.length) * 0.4}
                     /> 
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((ind, idx) => (
          <Link 
            key={idx} 
            to={`/industry/${encodeURIComponent(ind.industry)}`}
            className="group block p-6 bg-gradient-to-br from-insight-card to-[#12121e] border border-gray-800 rounded-2xl hover:border-insight-blue transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-100 group-hover:text-insight-blue transition-colors">{ind.industry.replace(/_/g, ' ')}</h3>
              <span className="bg-insight-purple/20 text-insight-purple text-xs font-bold px-2 py-1 rounded-full border border-insight-purple/30">
                Rank #{ind.rank || idx + 1}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Overall Score:</span>
              <span className="text-gray-100 font-bold text-lg">{ind.overall_score || 'N/A'}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
