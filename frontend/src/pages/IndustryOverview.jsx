import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIndustrySummary } from '../utils/dataFetcher';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function IndustryOverview() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="industry" stroke="#666" tick={{fill: '#888', fontSize: 11}} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" tick={{fill: '#888', fontSize: 11}} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#2a2a3a'}}
                  contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="overall_score" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                     <div key={`cell-${index}`} fill="#3b82f6" /> 
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
