import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchQualitativeAnalysis } from '../utils/dataFetcher';
import TagBadge from '../components/TagBadge';
import ScoreCard from '../components/ScoreCard';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import { ArrowLeft, Users } from 'lucide-react';

export default function CompanyDashboard() {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualitativeAnalysis(symbol)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(`Failed to load data for ${symbol.toUpperCase()}.`);
        setLoading(false);
      });
  }, [symbol]);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Dashboard...</div>;
  if (error || !data) return <div className="p-10 text-center text-red-400">{error || 'Data not found.'}</div>;

  const {
    business_overview,
    business_quality_signals,
    cyclicality_signals,
    return_profile_signals,
    governance_signals,
    pros_and_cons,
    quantitative_data
  } = data;

  const symbolUpper = symbol.toUpperCase();
  const Scores = {
    BQ: business_quality_signals?.BQ,
    CY: cyclicality_signals?.CY,
    RP: return_profile_signals?.RP,
    BG: governance_signals?.BG
  };

  const Pros = pros_and_cons?.pros || [];
  const Cons = pros_and_cons?.cons || [];

  const recentMetrics = quantitative_data?.Recent || {};
  const historical = quantitative_data?.Historical || {};

  const Chart_Data = [
    { date: '5Y', value: historical['Return over 5years'] ? historical['Return over 5years'] * 100 : 0 },
    { date: '3Y', value: historical['Return over 3years'] ? historical['Return over 3years'] * 100 : 0 },
    { date: '1Y', value: historical['Return over 1year'] ? historical['Return over 1year'] * 100 : 0 }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-2">
        <Link to="/" className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Search
        </Link>
        <Link to={`/company/${symbol}/peers`} className="text-insight-purple hover:text-white transition-colors flex items-center gap-2 text-sm font-medium bg-insight-purple/10 px-4 py-2 rounded-full border border-insight-purple/30 shadow">
          <Users size={16} /> Compare Peers
        </Link>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative overflow-hidden">
        <div className="relative z-10 text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100">{symbolUpper}</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-3">
            <span>{business_overview?.industry_position || 'Industry Leader'}</span>
          </p>
        </div>
        <div className="relative z-10 left-0">
          <TagBadge label="Watchlist" className="text-lg px-4 py-1" />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-insight-blue/5 rounded-full blur-[80px]" />
      </header>

      {/* Score Cards Row */}
      <section>
        <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4 ml-1">Core AI Evaluation</h2>
        <ScoreCard scores={Scores} />
      </section>

      {/* Chart Section */}
      <section className="relative">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">Historical Return Trend (%)</h2>
        </div>
        <ChartCard data={Chart_Data} />
      </section>

      {/* Pros & Cons */}
      {(Pros.length > 0 || Cons.length > 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-950/20 border border-green-900/50 p-6 rounded-2xl shadow-inner shadow-green-900/10">
            <h3 className="text-green-500 font-bold mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Pros
            </h3>
            <ul className="space-y-3">
              {Pros.map((pro, idx) => (
                <li key={idx} className="text-gray-300 text-sm leading-relaxed flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl shadow-inner shadow-red-900/10">
            <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Cons
            </h3>
            <ul className="space-y-3">
              {Cons.map((con, idx) => (
                <li key={idx} className="text-gray-300 text-sm leading-relaxed flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Market Snapshot */}
      <section>
        <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4 ml-1">Market Snapshot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <MetricCard label="PE Ratio" value={recentMetrics["Price to Earning"]} />
          <MetricCard label="ROE" value={recentMetrics["Return on equity"] ? (recentMetrics["Return on equity"] * 100).toFixed(2) + '%' : null} />
          <MetricCard label="ROCE" value={recentMetrics["Return on capital employed"] ? (recentMetrics["Return on capital employed"] * 100).toFixed(2) + '%' : null} />
          <MetricCard label="Debt/Equity" value={recentMetrics["Debt to equity"]} />
          <MetricCard label="Dividend Yield" value={recentMetrics["Dividend yield"]} />
          <MetricCard label="EPS" value={recentMetrics["EPS"]} />
          <MetricCard label="Sales Growth" value={recentMetrics["Sales growth"] ? (recentMetrics["Sales growth"] * 100).toFixed(2) + '%' : null} />
          <MetricCard label="Profit Growth" value={recentMetrics["Profit growth"] ? (recentMetrics["Profit growth"] * 100).toFixed(2) + '%' : null} />
        </div>
      </section>

    </div>
  );
}
