import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { fetchIndustrySummary, fetchTopPerformers } from '../utils/dataFetcher';
import { Globe, LayoutGrid, Building2 } from 'lucide-react';

export default function LandingPage() {
  const [topIndustries, setTopIndustries] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);

  useEffect(() => {
    // Fetch Top Industries
    fetchIndustrySummary()
      .then(res => {
        const arr = res.rankings || [];
        arr.sort((a, b) => (a.rank || 0) - (b.rank || 0));
        setTopIndustries(arr.slice(0, 5));
      })
      .catch(console.error);

    // Fetch Top Companies dynamically
    fetchTopPerformers()
      .then(data => {
        if (!data || !Array.isArray(data)) {
          console.warn("Top performers API returned invalid data:", data);
          return;
        }
        const formatted = data.map(c => ({
          ticker: c.symbol,
          industry: (c.industry || c.business_overview?.industry_position || 'N/A').replace(/_/g, ' ')
        }));
        setTopCompanies(formatted);
      })
      .catch(err => console.error("Failed to fetch top performers:", err));
  }, []); // useEffect ends here correctly

  // Move this function outside of useEffect so the button can see it
  const handleFocusSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const input = document.getElementById('search'); // Ensure SearchBar component has id="search"
    if (input) input.focus();
  };

  // The component return must be out here
  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-16 px-4 md:px-8 relative overflow-x-hidden fade-in">
      {/* Background radial gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-insight-blue/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-insight-purple/10 rounded-full blur-[150px] pointer-events-none" />

      {/* 1. Hero Section */}
      <div className="relative z-50 text-center max-w-3xl w-full mb-20 mt-10">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-insight-blue via-indigo-400 to-insight-purple">
            InsightLedger+
          </span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-10 font-medium tracking-wide">
          Relative Stock Intelligence Platform
        </p>

        <div className="relative z-50 flex justify-center w-full transform transition-transform duration-300 hover:scale-[1.02]">
          <SearchBar className="shadow-xl" />
        </div>
      </div>

      {/* 2. Explore Analysis Section */}
      <section className="z-10 max-w-6xl w-full mb-20">
        <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-6 text-center">Explore Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Company Analysis Card */}
          <div className="group rounded-2xl p-[1px] bg-gradient-to-br from-gray-800 to-gray-900 hover:from-insight-blue/50 hover:to-indigo-500/50 transition-all duration-300 hover:scale-[1.02] shadow-lg">
            <div className="bg-[#12121c] p-6 rounded-2xl h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={18} className="text-insight-blue" />
                  <h3 className="text-xl font-bold text-gray-100 group-hover:text-insight-blue transition-colors">Company</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">Search individual companies for qualitative deep dives and relative metrics.</p>
              </div>
              <button
                onClick={handleFocusSearch}
                className="self-start px-5 py-2.5 rounded-full bg-insight-blue/10 text-insight-blue text-sm font-semibold border border-insight-blue/30 hover:bg-insight-blue hover:text-white transition-all shadow-sm"
              >
                Go to Search
              </button>
            </div>
          </div>

          {/* Whole Index Leaderboard Card */}
          <div className="group rounded-2xl p-[1px] bg-gradient-to-br from-gray-800 to-gray-900 hover:from-emerald-500/50 hover:to-insight-blue/50 transition-all duration-300 hover:scale-[1.02] shadow-lg">
            <div className="bg-[#12121c] p-6 rounded-2xl h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={18} className="text-emerald-400" />
                  <h3 className="text-xl font-bold text-gray-100 group-hover:text-emerald-400 transition-colors">Index Leaderboard</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">View global rankings across all companies using standardized Z-Scores to find top performers.</p>
              </div>
              <Link
                to="/index"
                className="self-start px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
              >
                View Global Index
              </Link>
            </div>
          </div>

          {/* Industry Analysis Card */}
          <div className="group rounded-2xl p-[1px] bg-gradient-to-br from-gray-800 to-gray-900 hover:from-insight-purple/50 hover:to-indigo-500/50 transition-all duration-300 hover:scale-[1.02] shadow-lg">
            <div className="bg-[#12121c] p-6 rounded-2xl h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <LayoutGrid size={18} className="text-insight-purple" />
                  <h3 className="text-xl font-bold text-gray-100 group-hover:text-insight-purple transition-colors">Industries</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">Explore industry-wide performance, aggregate scoring, and sector rankings at a glance.</p>
              </div>
              <Link
                to="/industries"
                className="self-start px-5 py-2.5 rounded-full bg-insight-purple/10 text-insight-purple text-sm font-semibold border border-insight-purple/30 hover:bg-insight-purple hover:text-white transition-all shadow-sm"
              >
                View Industries
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Access Section */}
      <section className="z-10 max-w-5xl w-full">
        <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-8 text-center mt-4">Quick Access</h2>

        {/* Top Companies */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-bold text-gray-200">Top Companies</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {topCompanies.map((company, idx) => (
              <Link
                key={idx}
                to={`/company/${company.ticker}`}
                className="group bg-[#1a1a24] p-4 rounded-xl border border-gray-800 hover:border-insight-blue/50 hover:bg-[#1f1f2e] transition-all transform hover:scale-[1.03] shadow-md flex flex-col items-center justify-center text-center"
              >
                <span className="text-base font-bold text-gray-100 group-hover:text-insight-blue mb-1">{company.ticker}</span>
                <span className="text-xs text-gray-500 font-medium line-clamp-1">{company.industry}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Industries */}
        {topIndustries.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-lg font-bold text-gray-200">Top Ranked Industries</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {topIndustries.map((ind, idx) => (
                <Link
                  key={idx}
                  to={`/industry/${encodeURIComponent(ind.industry)}`}
                  className="group relative bg-[#1a1a24] p-4 rounded-xl border border-gray-800 hover:border-insight-purple/50 hover:bg-[#1f1f2e] transition-all transform hover:scale-[1.03] shadow-md overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-insight-purple/10 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="text-sm font-bold text-gray-100 group-hover:text-insight-purple mb-2 line-clamp-2">
                    {ind.industry.replace(/_/g, ' ')}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-gray-400">Score: <span className="text-gray-200 font-semibold">{ind.overall_score}</span></span>
                    <span className="bg-insight-purple/20 text-insight-purple text-[10px] font-bold px-2 py-0.5 rounded-full border border-insight-purple/30">
                      #{ind.rank}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}