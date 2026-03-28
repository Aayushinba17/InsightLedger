import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function IndustryDashboard() {
  const { industry } = useParams();

  // State for all three pieces of data we need
  const [data, setData] = useState(null); // High-level industry metrics
  const [companies, setCompanies] = useState([]); // List of stocks in this industry
  const [sectorEval, setSectorEval] = useState(null); // The AI peer evaluation (justifications)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAllIndustryData = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const encodedIndustry = encodeURIComponent(industry);

        // Fetch all 3 endpoints concurrently to save loading time
        const [industryRes, companiesRes, sectorRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/industry/${encodedIndustry}`),
          fetch(`${API_BASE_URL}/api/industry/${encodedIndustry}/companies`),
          fetch(`${API_BASE_URL}/api/sector/${encodedIndustry}`)
        ]);

        if (!industryRes.ok) throw new Error('Industry not found');

        const industryJson = await industryRes.json();
        // The endpoints might return 404 if data isn't ready, so we gracefully fallback to empty arrays/objects
        const companiesJson = companiesRes.ok ? await companiesRes.json() : [];
        const sectorJson = sectorRes.ok ? await sectorRes.json() : null;

        setData(industryJson);
        setCompanies(companiesJson);
        setSectorEval(sectorJson);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };

    fetchAllIndustryData();
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

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100">{(data.industry || industry).replace(/_/g, ' ')}</h1>
          <p className="text-gray-400 mt-2 flex gap-4">
            <span className="bg-insight-blue/20 text-insight-blue px-3 py-1 rounded-full text-sm font-bold border border-insight-blue/30">
              Rank #{data.industry_rank || 'N/A'}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-gray-300">
              Z-Score: <span className="text-white">{data.overall_industry_score !== undefined ? data.overall_industry_score.toFixed(2) : 'N/A'}</span>
            </span>
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
      </header>

      {/* High-level Metric Cards */}
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

      {/* Bar Chart */}
      <section className="bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold">Industry Dimension Analysis</h2>
            <p className="text-xs text-gray-400 mt-1">Z-Score normalized: -3 (weak) to +3 (strong)</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="colorGro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="95%" stopColor="#064e3b" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="colorSaf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={1} />
                  <stop offset="95%" stopColor="#78350f" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                  <stop offset="95%" stopColor="#4c1d95" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis domain={[-3, 3]} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: '#2a2a3a' }}
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

      {/* --- MENTOR UPDATES: Best Performer & Company List --- */}

      {/* 1. Best Performing Company Spotlight */}
      {sectorEval?.best_performing_company && (
        <section className="bg-yellow-900/20 border border-yellow-700/50 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px]" />
          <h2 className="text-yellow-500 text-sm tracking-widest uppercase font-bold mb-3 flex items-center gap-2 relative z-10">
            <Trophy size={18} /> Best Performing Company
          </h2>
          <div className="flex items-end gap-4 relative z-10">
            <Link to={`/company/${sectorEval.best_performing_company}`} className="text-4xl font-extrabold text-white hover:text-yellow-400 transition-colors">
              {sectorEval.best_performing_company}
            </Link>
          </div>
          <p className="text-gray-300 mt-4 leading-relaxed relative z-10">
            <span className="font-semibold text-yellow-500/80 mr-2">AI Justification:</span>
            {sectorEval.best_company_justification || "Consistently strong fundamentals compared to industry peers."}
          </p>
        </section>
      )}

      {/* 2. List of Companies with Scores */}
      {companies.length > 0 && (
        <section className="bg-insight-card p-6 rounded-2xl border border-gray-800">
          <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-6">Industry Constituents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {companies.map((comp) => (
              <div key={comp.symbol} className="bg-[#12121e] p-4 rounded-xl border border-gray-800 hover:border-insight-blue/50 transition-colors flex flex-col justify-between">
                <Link to={`/company/${comp.symbol}`} className="font-bold text-lg text-insight-blue hover:text-white transition-colors mb-2">
                  {comp.symbol}
                </Link>
                <div className="flex justify-between items-end border-t border-gray-800 pt-2 mt-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Score</p>
                    <p className="text-white font-semibold">{comp.fundamental_score ? Number(comp.fundamental_score).toFixed(2) : 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Z-Score</p>
                    <p className="text-gray-300 font-medium">{comp.z_score ? Number(comp.z_score).toFixed(2) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}