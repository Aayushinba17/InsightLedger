import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '../utils/cn';

const companyFiles = import.meta.glob('../../../data/qualitative_insights/*/*_individual.json', { eager: true });
const oldCompanyFiles = import.meta.glob('../../../data/qualitative_insights/*/business_overview.json', { eager: true });
const industrySummaryFile = import.meta.glob('../../../data/industry_evaluations/_industry_summary.json', { eager: true });

export default function SearchBar({ className }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const options = useMemo(() => {
    let opts = [];
    try {
      // 1. Get companies from directory paths
      const companies = new Set();
      for (const path in companyFiles) {
        const parts = path.split('/');
        const symbol = parts[parts.length - 2];
        if (symbol) companies.add(symbol);
      }
      for (const path in oldCompanyFiles) {
        const parts = path.split('/');
        const symbol = parts[parts.length - 2];
        if (symbol) companies.add(symbol);
      }
      companies.forEach(c => {
        opts.push({ label: c, type: 'company', value: c });
      });

      // 2. Get industries from _industry_summary.json
      let indSummary = null;
      for (const path in industrySummaryFile) {
        indSummary = industrySummaryFile[path]?.default || industrySummaryFile[path];
      }
      if (indSummary?.rankings) {
        indSummary.rankings.forEach(r => {
          if (r.industry) {
            const diplayName = r.industry.replace(/_/g, ' ');
            opts.push({ label: diplayName, type: 'industry', value: r.industry });
          }
        });
      }
    } catch (e) {
      console.error("Error loading search options:", e);
    }
    return opts;
  }, []);

  const filteredOptions = query.trim() === '' 
    ? [] 
    : options.filter(opt => opt.label.toLowerCase().includes(query.toLowerCase())).slice(0, 10);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/company/${query.trim().toUpperCase()}`);
      setShowDropdown(false);
    }
  };

  const handleSelect = (opt) => {
    setQuery(opt.label);
    setShowDropdown(false);
    if (opt.type === 'company') {
      navigate(`/company/${opt.value.toUpperCase()}`);
    } else {
      navigate(`/industry/${opt.value}`);
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative w-full max-w-xl", className)}>
      <form onSubmit={handleSearch}>
        <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-lg bg-insight-card border border-gray-700 overflow-hidden transition-all duration-300 focus-within:border-insight-blue focus-within:ring-2 focus-within:ring-insight-blue/20">
          <div className="grid place-items-center h-full w-12 text-gray-400">
            <Search size={20} />
          </div>
          <input
            className="peer h-full w-full outline-none text-sm text-gray-100 bg-transparent pr-2 placeholder-gray-500"
            type="text"
            id="search"
            placeholder="Search by company or industry..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
          />
          <button type="submit" className="h-full px-6 bg-gradient-to-r from-insight-blue to-insight-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            Search
          </button>
        </div>
      </form>

      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-[999] top-full mt-2 left-0 w-full bg-[#1a1a2e] border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
          <ul className="max-h-64 overflow-y-auto w-full">
            {filteredOptions.map((opt, idx) => (
              <li 
                key={idx}
                className="px-4 py-3 hover:bg-gray-800 cursor-pointer flex items-center justify-between border-b border-gray-800/50 last:border-none"
                onClick={() => handleSelect(opt)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="text-sm font-medium text-gray-200">{opt.label}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 capitalize">{opt.type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
