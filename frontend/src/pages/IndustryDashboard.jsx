import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MetricCard from '../components/MetricCard';

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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
      <div className="flex items-center justify-between mb-2">
        <Link to="/industries" className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Industries
        </Link>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100">{(data.industry || industry).replace(/_/g, ' ')}</h1>
          <p className="text-gray-400 mt-2 flex gap-4">
             <span className="bg-insight-blue/20 text-insight-blue px-3 py-1 rounded-full text-sm font-bold border border-insight-blue/30">
               Rank #{data.industry_rank}
             </span>
             <span className="flex items-center gap-1 text-sm font-semibold text-gray-300">
               Overall Score: <span className="text-white">{data.overall_industry_score}</span>
             </span>
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Revenue Health</h3>
           <p className="text-3xl font-extrabold text-white">{data.normalized_scores?.revenue_health ?? 'N/A'}</p>
         </div>
         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Growth</h3>
           <p className="text-3xl font-extrabold text-white">{data.normalized_scores?.quarterly_growth ?? 'N/A'}</p>
         </div>
         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Investment Safety</h3>
           <p className="text-3xl font-extrabold text-white">{data.normalized_scores?.investment_safety ?? 'N/A'}</p>
         </div>
      </section>

    </div>
  );
}
