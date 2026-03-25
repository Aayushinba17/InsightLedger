import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '../utils/cn';

export default function SearchBar({ className }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/company/${query.trim().toUpperCase()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn("relative w-full max-w-xl", className)}>
      <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-lg bg-insight-card border border-gray-700 overflow-hidden transition-all duration-300 focus-within:border-insight-blue focus-within:ring-2 focus-within:ring-insight-blue/20">
        <div className="grid place-items-center h-full w-12 text-gray-400">
          <Search size={20} />
        </div>
        <input
          className="peer h-full w-full outline-none text-sm text-gray-100 bg-transparent pr-2 placeholder-gray-500"
          type="text"
          id="search"
          placeholder="Search by company name or symbol..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="h-full px-6 bg-gradient-to-r from-insight-blue to-insight-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity">
          Search
        </button>
      </div>
    </form>
  );
}
