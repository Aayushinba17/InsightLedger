import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function IndustryDashboard() {
  const { industry } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchIndustryData = async () => {
      try {
        const res = await fetch(`/data/industry_evaluations/${encodeURIComponent(industry)}_industry.json`);
        if (!res.ok) throw new Error('Not found');
        const json = await res.json();
        setData(json);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };
    fetchIndustryData();
  }, [industry]);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Industry Dashboard...</div>;
  if (error || !data) return <div className="p-10 text-center text-red-400">Industry data not found.</div>;

  const getScore = (val) => (val !== null && val !== undefined ? val : null);

  const rawScores = data.normalized_scores || data.dimension_scores || {};
  const revHealth = getScore(rawScores.revenue_health);
  const growth = getScore(rawScores.quarterly_growth);
  const invSafety = getScore(rawScores.investment_safety);
  const comp = getScore(rawScores.composite) ?? getScore(data.overall_industry_score);

  const chartData = [
    { name: 'Revenue', value: revHealth !== null ? Number(revHealth) : 0 },
    { name: 'Growth', value: growth !== null ? Number(growth) : 0 },
    { name: 'Safety', value: invSafety !== null ? Number(invSafety) : 0 },
    { name: 'Composite', value: comp !== null ? Number(comp) : 0 }
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
      <div className="flex items-center gap-4 mb-2">
        <Link to="/" className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="h-4 w-px bg-gray-700"></div>
        <Link to="/industries" className="text-gray-500 hover:text-insight-purple transition-colors flex items-center text-sm font-medium">
          Back to Industries
        </Link>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100">{(data.industry || industry).replace(/_/g, ' ')}</h1>
          <p className="text-gray-400 mt-2 flex gap-4">
             <span className="bg-insight-blue/20 text-insight-blue px-3 py-1 rounded-full text-sm font-bold border border-insight-blue/30">
               Rank #{data.industry_rank || 'N/A'}
             </span>
             <span className="flex items-center gap-1 text-sm font-semibold text-gray-300">
               Overall Score: <span className="text-white">{data.overall_industry_score !== undefined ? data.overall_industry_score : 'N/A'}</span>
             </span>
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Revenue Health</h3>
           <p className="text-3xl font-extrabold text-white">{revHealth ?? 'N/A'}</p>
         </div>
         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Growth</h3>
           <p className="text-3xl font-extrabold text-white">{growth ?? 'N/A'}</p>
         </div>
         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Investment Safety</h3>
           <p className="text-3xl font-extrabold text-white">{invSafety ?? 'N/A'}</p>
         </div>
      </section>

      <section className="bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative">
        <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-6">Industry Dimension Analysis</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorGro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#064e3b" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorSaf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#78350f" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#4c1d95" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#888" tick={{fill: '#888', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#2a2a3a'}}
                contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => {
                  const gradientIds = ['url(#colorRev)', 'url(#colorGro)', 'url(#colorSaf)', 'url(#colorCom)'];
                  return <Cell key={`cell-${index}`} fill={gradientIds[index % gradientIds.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
}
