// // import React, { useEffect, useState } from 'react';
// // import { useParams, Link } from 'react-router-dom';
// // import { ArrowLeft, Trophy } from 'lucide-react';
// // import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// // export default function IndustryDashboard() {
// //   const { industry } = useParams();

// //   // State for all three pieces of data we need
// //   const [data, setData] = useState(null); // High-level industry metrics
// //   const [companies, setCompanies] = useState([]); // List of stocks in this industry
// //   const [sectorEval, setSectorEval] = useState(null); // The AI peer evaluation (justifications)

// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(false);

// //   useEffect(() => {
// //     const fetchAllIndustryData = async () => {
// //       try {
// //         const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// //         const encodedIndustry = encodeURIComponent(industry);

// //         // Fetch all 3 endpoints concurrently to save loading time
// //         const [industryRes, companiesRes, sectorRes] = await Promise.all([
// //           fetch(`${API_BASE_URL}/api/industry/${encodedIndustry}`),
// //           fetch(`${API_BASE_URL}/api/industry/${encodedIndustry}/companies`),
// //           fetch(`${API_BASE_URL}/api/sector/${encodedIndustry}`)
// //         ]);

// //         if (!industryRes.ok) throw new Error('Industry not found');

// //         const industryJson = await industryRes.json();
// //         // The endpoints might return 404 if data isn't ready, so we gracefully fallback to empty arrays/objects
// //         const companiesJson = companiesRes.ok ? await companiesRes.json() : [];
// //         const sectorJson = sectorRes.ok ? await sectorRes.json() : null;

// //         setData(industryJson);
// //         setCompanies(companiesJson);
// //         setSectorEval(sectorJson);
// //         setLoading(false);
// //       } catch (err) {
// //         console.error(err);
// //         setError(true);
// //         setLoading(false);
// //       }
// //     };

// //     fetchAllIndustryData();
// //   }, [industry]);

// //   if (loading) return <div className="p-10 text-center text-gray-400">Loading Industry Dashboard...</div>;
// //   if (error || !data) return <div className="p-10 text-center text-red-400">Industry data not found.</div>;

// //   const getScore = (val) => (val !== null && val !== undefined ? val : null);

// //   const rawScores = data.normalized_scores || data.dimension_scores || {};
// //   const revHealth = getScore(rawScores.revenue_health);
// //   const growth = getScore(rawScores.quarterly_growth);
// //   const invSafety = getScore(rawScores.investment_safety);
// //   const comp = getScore(rawScores.composite) ?? getScore(data.overall_industry_score);

// //   const chartData = [
// //     { name: 'Revenue', value: revHealth !== null ? Number(revHealth) : 0 },
// //     { name: 'Growth', value: growth !== null ? Number(growth) : 0 },
// //     { name: 'Safety', value: invSafety !== null ? Number(invSafety) : 0 },
// //     { name: 'Composite', value: comp !== null ? Number(comp) : 0 }
// //   ];

// //   return (
// //     <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
// //       <div className="flex items-center gap-4 mb-2">
// //         <Link to="/" className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
// //           <ArrowLeft size={16} /> Back to Home
// //         </Link>
// //         <div className="h-4 w-px bg-gray-700"></div>
// //         <Link to="/industries" className="text-gray-500 hover:text-insight-purple transition-colors flex items-center text-sm font-medium">
// //           Back to Industries
// //         </Link>
// //       </div>

// //       {/* Header */}
// //       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative overflow-hidden">
// //         <div className="relative z-10">
// //           <h1 className="text-3xl md:text-4xl font-bold text-gray-100">{(data.industry || industry).replace(/_/g, ' ')}</h1>
// //           <p className="text-gray-400 mt-2 flex gap-4">
// //             <span className="bg-insight-blue/20 text-insight-blue px-3 py-1 rounded-full text-sm font-bold border border-insight-blue/30">
// //               Rank #{data.industry_rank || 'N/A'}
// //             </span>
// //             <span className="flex items-center gap-1 text-sm font-semibold text-gray-300">
// //               Z-Score: <span className="text-white">{data.overall_industry_score !== undefined ? data.overall_industry_score.toFixed(2) : 'N/A'}</span>
// //             </span>
// //           </p>
// //         </div>
// //         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
// //       </header>

// //       {/* High-level Metric Cards */}
// //       <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
// //           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Revenue Health</h3>
// //           <p className="text-3xl font-extrabold text-white">{revHealth ?? 'N/A'}</p>
// //         </div>
// //         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
// //           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Growth</h3>
// //           <p className="text-3xl font-extrabold text-white">{growth ?? 'N/A'}</p>
// //         </div>
// //         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
// //           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Investment Safety</h3>
// //           <p className="text-3xl font-extrabold text-white">{invSafety ?? 'N/A'}</p>
// //         </div>
// //       </section>

// //       {/* Bar Chart */}
// //       <section className="bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative">
// //         <div className="flex items-center justify-between mb-6">
// //           <div>
// //             <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold">Industry Dimension Analysis</h2>
// //             <p className="text-xs text-gray-400 mt-1">Z-Score normalized: -3 (weak) to +3 (strong)</p>
// //           </div>
// //         </div>
// //         <div className="h-64 w-full">
// //           <ResponsiveContainer width="100%" height="100%">
// //             <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
// //               <defs>
// //                 <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
// //                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
// //                   <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.8} />
// //                 </linearGradient>
// //                 <linearGradient id="colorGro" x1="0" y1="0" x2="0" y2="1">
// //                   <stop offset="5%" stopColor="#10b981" stopOpacity={1} />
// //                   <stop offset="95%" stopColor="#064e3b" stopOpacity={0.8} />
// //                 </linearGradient>
// //                 <linearGradient id="colorSaf" x1="0" y1="0" x2="0" y2="1">
// //                   <stop offset="5%" stopColor="#f59e0b" stopOpacity={1} />
// //                   <stop offset="95%" stopColor="#78350f" stopOpacity={0.8} />
// //                 </linearGradient>
// //                 <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
// //                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
// //                   <stop offset="95%" stopColor="#4c1d95" stopOpacity={0.8} />
// //                 </linearGradient>
// //               </defs>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
// //               <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} />
// //               <YAxis domain={[-3, 3]} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} />
// //               <Tooltip
// //                 cursor={{ fill: '#2a2a3a' }}
// //                 contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
// //                 itemStyle={{ color: '#fff' }}
// //               />
// //               <Bar dataKey="value" radius={[4, 4, 0, 0]}>
// //                 {chartData.map((entry, index) => {
// //                   const gradientIds = ['url(#colorRev)', 'url(#colorGro)', 'url(#colorSaf)', 'url(#colorCom)'];
// //                   return <Cell key={`cell-${index}`} fill={gradientIds[index % gradientIds.length]} />;
// //                 })}
// //               </Bar>
// //             </BarChart>
// //           </ResponsiveContainer>
// //         </div>
// //       </section>

//       {/* --- MENTOR UPDATES: Best Performer & Company List --- */}

      // {/* 1. Best Performing Company Spotlight */}
      // {sectorEval?.best_performing_company && (
      //   <section className="bg-yellow-900/20 border border-yellow-700/50 p-6 rounded-2xl relative overflow-hidden">
      //     <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px]" />
      //     <h2 className="text-yellow-500 text-sm tracking-widest uppercase font-bold mb-3 flex items-center gap-2 relative z-10">
      //       <Trophy size={18} /> Best Performing Company
      //     </h2>
      //     <div className="flex items-end gap-4 relative z-10">
      //       <Link to={`/company/${sectorEval.best_performing_company}`} className="text-4xl font-extrabold text-white hover:text-yellow-400 transition-colors">
      //         {sectorEval.best_performing_company}
      //       </Link>
      //     </div>
      //     <p className="text-gray-300 mt-4 leading-relaxed relative z-10">
      //       <span className="font-semibold text-yellow-500/80 mr-2">AI Justification:</span>
      //       {sectorEval.best_company_justification || "Consistently strong fundamentals compared to industry peers."}
      //     </p>
      //   </section>
      // )}

      // {/* 2. List of Companies with Scores */}
      // {companies.length > 0 && (
      //   <section className="bg-insight-card p-6 rounded-2xl border border-gray-800">
      //     <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-6">Industry Constituents</h2>
      //     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      //       {companies.map((comp) => (
      //         <div key={comp.symbol} className="bg-[#12121e] p-4 rounded-xl border border-gray-800 hover:border-insight-blue/50 transition-colors flex flex-col justify-between">
      //           <Link to={`/company/${comp.symbol}`} className="font-bold text-lg text-insight-blue hover:text-white transition-colors mb-2">
      //             {comp.symbol}
      //           </Link>
      //           <div className="flex justify-between items-end border-t border-gray-800 pt-2 mt-2">
      //             <div>
      //               <p className="text-xs text-gray-500 uppercase tracking-wider">Score</p>
      //               <p className="text-white font-semibold">{comp.fundamental_score ? Number(comp.fundamental_score).toFixed(2) : 'N/A'}</p>
      //             </div>
      //             <div className="text-right">
      //               <p className="text-xs text-gray-500 uppercase tracking-wider">Z-Score</p>
      //               <p className="text-gray-300 font-medium">{comp.z_score ? Number(comp.z_score).toFixed(2) : 'N/A'}</p>
      //             </div>
      //           </div>
      //         </div>
      //       ))}
      //     </div>
      //   </section>
      // )}

// //     </div>
// //   );
// // }



// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { ArrowLeft, Trophy, ArrowRight } from 'lucide-react';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// export default function IndustryDashboard() {
//   const { industry } = useParams();

//   // State for all three pieces of data we need
//   const [data, setData] = useState(null); // High-level industry metrics
//   const [companies, setCompanies] = useState([]); // List of stocks in this industry
//   const [sectorEval, setSectorEval] = useState(null); // The AI peer evaluation (justifications)

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     const fetchAllIndustryData = async () => {
//       try {
//         const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
//         const encodedIndustry = encodeURIComponent(industry);

//         // Fetch all 3 endpoints concurrently to save loading time
//         const [industryRes, companiesRes, sectorRes] = await Promise.all([
//           fetch(`${API_BASE_URL}/api/industry/${encodedIndustry}`),
//           fetch(`${API_BASE_URL}/api/industry/${encodedIndustry}/companies`),
//           fetch(`${API_BASE_URL}/api/sector/${encodedIndustry}`)
//         ]);

//         if (!industryRes.ok) throw new Error('Industry not found');

//         const industryJson = await industryRes.json();
//         // The endpoints might return 404 if data isn't ready, so we gracefully fallback to empty arrays/objects
//         const companiesJson = companiesRes.ok ? await companiesRes.json() : [];
//         const sectorJson = sectorRes.ok ? await sectorRes.json() : null;

//         setData(industryJson);
//         setCompanies(companiesJson);
//         setSectorEval(sectorJson);
//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setError(true);
//         setLoading(false);
//       }
//     };

//     fetchAllIndustryData();
//   }, [industry]);

//   if (loading) return <div className="p-10 text-center text-gray-400">Loading Industry Dashboard...</div>;
//   if (error || !data) return <div className="p-10 text-center text-red-400">Industry data not found.</div>;

//   const getScore = (val) => (val !== null && val !== undefined ? val : null);

//   const rawScores = data.normalized_scores || data.dimension_scores || {};
//   const revHealth = getScore(rawScores.revenue_health);
//   const growth = getScore(rawScores.quarterly_growth);
//   const invSafety = getScore(rawScores.investment_safety);
//   const comp = getScore(rawScores.composite) ?? getScore(data.overall_industry_score);

//   const chartData = [
//     { name: 'Revenue', value: revHealth !== null ? Number(revHealth) : 0 },
//     { name: 'Growth', value: growth !== null ? Number(growth) : 0 },
//     { name: 'Safety', value: invSafety !== null ? Number(invSafety) : 0 },
//     { name: 'Composite', value: comp !== null ? Number(comp) : 0 }
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
//       <div className="flex items-center gap-4 mb-2">
//         <Link to="/" className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
//           <ArrowLeft size={16} /> Back to Home
//         </Link>
//         <div className="h-4 w-px bg-gray-700"></div>
//         <Link to="/industries" className="text-gray-500 hover:text-insight-purple transition-colors flex items-center text-sm font-medium">
//           Back to Industries
//         </Link>
//       </div>

//       {/* Header */}
//       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative overflow-hidden">
//         <div className="relative z-10">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-100">{(data.industry || industry).replace(/_/g, ' ')}</h1>
//           <p className="text-gray-400 mt-2 flex gap-4">
//             <span className="bg-insight-blue/20 text-insight-blue px-3 py-1 rounded-full text-sm font-bold border border-insight-blue/30">
//               Rank #{data.industry_rank || 'N/A'}
//             </span>
//             <span className="flex items-center gap-1 text-sm font-semibold text-gray-300">
//               Z-Score: <span className="text-white">{data.overall_industry_score !== undefined ? data.overall_industry_score.toFixed(2) : 'N/A'}</span>
//             </span>
//           </p>
//         </div>
//         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
//       </header>

//       {/* High-level Metric Cards */}
//       <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
//           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Revenue Health</h3>
//           <p className="text-3xl font-extrabold text-white">{revHealth ?? 'N/A'}</p>
//         </div>
//         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
//           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Growth</h3>
//           <p className="text-3xl font-extrabold text-white">{growth ?? 'N/A'}</p>
//         </div>
//         <div className="bg-[#12121e] border border-gray-800 p-6 rounded-2xl">
//           <h3 className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-2">Investment Safety</h3>
//           <p className="text-3xl font-extrabold text-white">{invSafety ?? 'N/A'}</p>
//         </div>
//       </section>

//       {/* Bar Chart */}
//       <section className="bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold">Industry Dimension Analysis</h2>
//             <p className="text-xs text-gray-400 mt-1">Z-Score normalized: -3 (weak) to +3 (strong)</p>
//           </div>
//         </div>
//         <div className="h-64 w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//               <defs>
//                 <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
//                   <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.8} />
//                 </linearGradient>
//                 <linearGradient id="colorGro" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#10b981" stopOpacity={1} />
//                   <stop offset="95%" stopColor="#064e3b" stopOpacity={0.8} />
//                 </linearGradient>
//                 <linearGradient id="colorSaf" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#f59e0b" stopOpacity={1} />
//                   <stop offset="95%" stopColor="#78350f" stopOpacity={0.8} />
//                 </linearGradient>
//                 <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
//                   <stop offset="95%" stopColor="#4c1d95" stopOpacity={0.8} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
//               <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} />
//               <YAxis domain={[-3, 3]} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} />
//               <Tooltip
//                 cursor={{ fill: '#2a2a3a' }}
//                 contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
//                 itemStyle={{ color: '#fff' }}
//               />
//               <Bar dataKey="value" radius={[4, 4, 0, 0]}>
//                 {chartData.map((entry, index) => {
//                   const gradientIds = ['url(#colorRev)', 'url(#colorGro)', 'url(#colorSaf)', 'url(#colorCom)'];
//                   return <Cell key={`cell-${index}`} fill={gradientIds[index % gradientIds.length]} />;
//                 })}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </section>

      {/* --- MENTOR UPDATES: Best Performer & Company List --- */}

      // {/* 1. Best Performing Company Spotlight */}
      // {sectorEval?.best_performing_company && (
      //   <section className="bg-yellow-900/20 border border-yellow-700/50 p-6 rounded-2xl relative overflow-hidden flex flex-col">
      //     <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px]" />
      //     <h2 className="text-yellow-500 text-sm tracking-widest uppercase font-bold mb-3 flex items-center gap-2 relative z-10">
      //       <Trophy size={18} /> Best Performing Company
      //     </h2>
      //     <div className="flex items-end gap-4 relative z-10">
      //       <Link to={`/company/${sectorEval.best_performing_company}`} className="text-4xl font-extrabold text-white hover:text-yellow-400 transition-colors">
      //         {sectorEval.best_performing_company}
      //       </Link>
      //     </div>
      //     <p className="text-gray-300 mt-4 mb-6 leading-relaxed relative z-10">
      //       <span className="font-semibold text-yellow-500/80 mr-2">AI Justification:</span>
      //       {sectorEval.best_company_justification || "Consistently strong fundamentals compared to industry peers."}
      //     </p>

      //     {/* --- NEW BUTTON: Links to the Peer Comparison Page --- */}
      //     <Link 
      //       to={`/company/${sectorEval.best_performing_company}/peers`}
      //       className="inline-flex items-center justify-center gap-2 w-full md:w-auto self-start py-2.5 px-5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 hover:text-yellow-300 rounded-xl font-bold transition-all text-xs uppercase tracking-widest relative z-10"
      //     >
      //       View Full Peer Leaderboard <ArrowRight size={16} />
      //     </Link>
      //   </section>
      // )}

      // {/* 2. List of Companies with Scores */}
      // {companies.length > 0 && (
      //   <section className="bg-insight-card p-6 rounded-2xl border border-gray-800">
      //     <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-6">Industry Constituents</h2>
      //     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      //       {companies.map((comp) => (
      //         <div key={comp.symbol} className="bg-[#12121e] p-4 rounded-xl border border-gray-800 hover:border-insight-blue/50 transition-colors flex flex-col justify-between">
      //           <Link to={`/company/${comp.symbol}`} className="font-bold text-lg text-insight-blue hover:text-white transition-colors mb-2">
      //             {comp.symbol}
      //           </Link>
      //           <div className="flex justify-between items-end border-t border-gray-800 pt-2 mt-2">
      //             <div>
      //               <p className="text-xs text-gray-500 uppercase tracking-wider">Score</p>
      //               <p className="text-white font-semibold">{comp.fundamental_score ? Number(comp.fundamental_score).toFixed(2) : 'N/A'}</p>
      //             </div>
      //             <div className="text-right">
      //               <p className="text-xs text-gray-500 uppercase tracking-wider">Z-Score</p>
      //               <p className="text-gray-300 font-medium">{comp.z_score ? Number(comp.z_score).toFixed(2) : 'N/A'}</p>
      //             </div>
      //           </div>
      //         </div>
      //       ))}
      //     </div>
      //   </section>
      // )}

//     </div>
//   );
// }




// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { ArrowLeft, Trophy, TrendingUp, TrendingDown, ArrowRight, Info } from 'lucide-react';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
// import { getInvestmentTag } from '../utils/getInvestmentTag';
// import TagBadge from '../components/TagBadge';

// export default function IndustryDashboard() {
//   const { industry } = useParams();

//   const [data, setData] = useState(null); 
//   const [companies, setCompanies] = useState([]); 
//   const [sectorEval, setSectorEval] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     const fetchAllIndustryData = async () => {
//       try {
//         const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
//         const encodedIndustry = encodeURIComponent(industry);

//         const [industryRes, sectorRes] = await Promise.all([
//           fetch(`${API_BASE_URL}/api/industry/${encodedIndustry}`),
//           fetch(`${API_BASE_URL}/api/sector/${encodedIndustry}`)
//         ]);

//         if (!industryRes.ok) throw new Error('Industry not found');

//         const industryJson = await industryRes.json();
//         const sectorJson = sectorRes.ok ? await sectorRes.json() : null;

//         // BULLETPROOF COMPANY EXTRACTION
//         // We pull directly from the industry JSON. If the DB has old string arrays, we convert them.
//         let rawCompanies = industryJson.companies || [];
//         rawCompanies = rawCompanies.map(c => typeof c === 'string' ? { symbol: c, final_score: 0 } : c);

//         setData(industryJson);
//         setCompanies(rawCompanies);
//         setSectorEval(sectorJson);
//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setError(true);
//         setLoading(false);
//       }
//     };

//     fetchAllIndustryData();
//   }, [industry]);

//   if (loading) return <div className="p-10 text-center text-gray-400">Loading Industry Dashboard...</div>;
//   if (error || !data) return <div className="p-10 text-center text-red-400">Industry data not found.</div>;

//   // --- Formatting Helpers ---
//   const formatZ = (val) => {
//     if (val === null || val === undefined) return 'N/A';
//     const num = Number(val);
//     return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
//   };

//   const getMetricColor = (val) => {
//     if (val === null || val === undefined) return 'text-gray-400';
//     return Number(val) > 0 ? 'text-green-400' : 'text-red-400';
//   };

//   const getScore = (val) => (val !== null && val !== undefined ? val : null);

//   const rawScores = data.normalized_scores || data.dimension_scores || {};
//   const revHealth = getScore(rawScores.revenue_health) ?? data.leader_score; 
//   const growth = getScore(rawScores.quarterly_growth) ?? data.depth_score;
//   const invSafety = getScore(rawScores.investment_safety) ?? data.tail_score;
//   const comp = getScore(rawScores.composite) ?? getScore(data.overall_industry_score) ?? data.final_industry_score;

//   const chartData = [
//     { name: 'Revenue', value: revHealth !== null ? Number(revHealth) : 0 },
//     { name: 'Growth', value: growth !== null ? Number(growth) : 0 },
//     { name: 'Safety', value: invSafety !== null ? Number(invSafety) : 0 },
//     { name: 'Composite', value: comp !== null ? Number(comp) : 0 }
//   ];

//   // ============================================================================
//   // EXACT LOGIC REQUESTED: Find Top Company by Maximum Score
//   // ============================================================================
// // ============================================================================
//   // FAILSAFE LOGIC: Find Top Company by Maximum Score Safely
//   // ============================================================================
//   // 1. Filter out any garbage data. Only keep companies that actually have a real score.
//   const validCompanies = companies.filter(c => 
//     c.z_score !== undefined || c.final_score !== undefined || c.fundamental_score !== undefined
//   );

//   // 2. Sort them mathematically (Highest to Lowest)
//   const sortedCompanies = [...validCompanies].sort((a, b) => {
//     const scoreA = Number(a.z_score ?? a.final_score ?? a.fundamental_score ?? -999);
//     const scoreB = Number(b.z_score ?? b.final_score ?? b.fundamental_score ?? -999);
//     return scoreB - scoreA; 
//   });

//   // 3. Only assign a top company if we have mathematical proof it is the best
//   const topCompany = sortedCompanies.length > 0 ? sortedCompanies[0] : null;
  
//   let dynamicReason = "Top ranked company in sector based on global Z-score evaluation.";
  
//   if (topCompany) {
//     if (topCompany.comments && topCompany.comments.length > 0) {
//       dynamicReason = topCompany.comments.join(". ") + ".";
//     } else if (topCompany.z_scores) {
//       const metricsMap = { bq: "Business Quality", cy: "Cyclicality", rp: "Return Profile", bg: "Governance", revenue: "Revenue Scale", growth: "Growth Metrics" };
//       const highestMetric = Object.entries(topCompany.z_scores).sort((a, b) => b[1] - a[1])[0];
      
//       if (highestMetric && highestMetric[1] > 0) {
//         dynamicReason = `Ranked #1 primarily driven by exceptional ${metricsMap[highestMetric[0]] || highestMetric[0]} (Z-Score: +${highestMetric[1].toFixed(2)}), outperforming sector averages.`;
//       }
//     }
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
//       <div className="flex items-center gap-4 mb-2">
//         <Link to="/" className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
//           <ArrowLeft size={16} /> Back to Home
//         </Link>
//         <div className="h-4 w-px bg-gray-700"></div>
//         <Link to="/industries" className="text-gray-500 hover:text-insight-purple transition-colors flex items-center text-sm font-medium">
//           Back to Industries
//         </Link>
//       </div>

//       <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6 relative">
//         <div>
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-100 tracking-tight">{(data.industry || industry).replace(/_/g, ' ')}</h1>
//           <div className="flex items-center gap-4 mt-3">
//             <span className="bg-insight-blue/10 text-insight-blue px-3 py-1 rounded-md text-sm font-bold border border-insight-blue/20">
//               Rank #{data.industry_rank || data.rank || 'N/A'}
//             </span>
//             <span className="text-sm text-gray-400">
//               Industry Z-Score: <span className={`font-mono font-bold ml-1 ${getMetricColor(comp)}`}>{formatZ(comp)}</span>
//             </span>
//           </div>
//         </div>
//       </header>

//       <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {[
//           { label: 'Revenue Health', val: revHealth },
//           { label: 'Growth', val: growth },
//           { label: 'Investment Safety', val: invSafety }
//         ].map((metric, idx) => (
//           <div key={idx} className="bg-insight-card border border-gray-800/60 p-5 rounded-xl shadow-sm flex items-center justify-between">
//             <div>
//               <h3 className="text-gray-500 text-xs tracking-widest uppercase font-bold mb-1">{metric.label}</h3>
//               <p className={`text-2xl font-mono font-bold ${getMetricColor(metric.val)}`}>
//                 {formatZ(metric.val)}
//               </p>
//             </div>
//             <div className={`p-3 rounded-full ${Number(metric.val) > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
//               {Number(metric.val) > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
//             </div>
//           </div>
//         ))}
//       </section>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <section className="lg:col-span-2 bg-insight-card p-6 rounded-xl border border-gray-800/60 shadow-sm relative">
//           <div className="mb-6">
//             <h2 className="text-sm uppercase tracking-widest text-gray-300 font-bold">Dimension Breakdown</h2>
//             <p className="text-xs text-gray-500 mt-1">Z-Score standard deviations from market mean</p>
//           </div>
//           <div className="h-64 w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
//                 <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} tickLine={false} axisLine={false} />
//                 <YAxis domain={[-3, 3]} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} tickLine={false} axisLine={false} />
//                 <Tooltip
//                   cursor={false} 
//                   contentStyle={{ backgroundColor: '#12121e', borderColor: '#333', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
//                   formatter={(value) => [formatZ(value), 'Z-Score']}
//                 />
//                 <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={40}>
//                   {chartData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#3b82f6' : '#ef4444'} opacity={0.8} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </section>

//         {/* ========================================================= */}
//         {/* THIS IS YOUR TOP PERFORMING COMPANY SPOTLIGHT AND BUTTON */}
//         {/* ========================================================= */}
//         {topCompany ? (
//           <section className="bg-gradient-to-br from-insight-card to-insight-blue/5 border border-insight-blue/20 p-6 rounded-xl relative flex flex-col justify-start">
//             <div className="flex items-center gap-2 text-insight-blue text-xs tracking-widest uppercase font-bold mb-4">
//               <Trophy size={16} /> Top Pick by Z-Score
//             </div>
            
//             <Link to={`/company/${topCompany.symbol}`} className="text-4xl font-extrabold text-white hover:text-insight-blue transition-colors mb-2">
//               {topCompany.symbol}
//             </Link>
            
//             <div className="flex items-center gap-3 mb-6">
//                <span className="text-sm text-gray-400">
//                  Global Z-Score: <span className="font-mono text-gray-200">{formatZ(topCompany.z_score || topCompany.final_score)}</span>
//                </span>
//             </div>
            
//             <div className="bg-black/20 p-4 rounded-lg border border-gray-800/50 mb-6">
//               <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Why this company?</p>
//               <p className="text-sm text-gray-300 leading-relaxed">
//                 {dynamicReason}
//               </p>
//             </div>

//             <Link 
//               to={`/company/${topCompany.symbol}/peers`}
//               className="mt-auto flex items-center justify-center gap-2 w-full py-3 px-4 bg-insight-blue/10 hover:bg-insight-blue/20 border border-insight-blue/30 text-insight-blue hover:text-white text-center rounded-xl font-bold transition-all text-xs uppercase tracking-widest"
//             >
//               View Full Peer Leaderboard <ArrowRight size={16} />
//             </Link>
//           </section>
//         ) : (
//           <div className="bg-insight-card border border-gray-800/60 p-6 rounded-xl flex items-center justify-center text-gray-500">
//              No companies available in this sector.
//           </div>
//         )}
//       </div>

//       {/* --- UNDERSTANDING THE METRICS SECTION --- */}
//       <section className="bg-insight-card p-6 rounded-xl border border-gray-800/60 shadow-sm">
//         <h2 className="text-sm uppercase tracking-widest text-gray-300 font-bold mb-5 flex items-center gap-2">
//           <Info size={16} className="text-insight-blue" />
//           Understanding the Metrics
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//           <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50">
//             <h4 className="text-gray-200 font-bold text-sm mb-2">Revenue Health (20%)</h4>
//             <ul className="text-gray-400 text-xs space-y-1.5 leading-relaxed">
//               <li>• <strong className="text-gray-300">OPM (30%)</strong>: Profit per dollar of sales</li>
//               <li>• <strong className="text-gray-300">ROE (35%)</strong>: Profit relative to equity</li>
//               <li>• <strong className="text-gray-300">ROCE (35%)</strong>: Capital return efficiency</li>
//             </ul>
//           </div>
//           <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50">
//             <h4 className="text-gray-200 font-bold text-sm mb-2">Growth (20%)</h4>
//             <ul className="text-gray-400 text-xs space-y-1.5 leading-relaxed">
//               <li>• <strong className="text-gray-300">YoY Sales</strong>: Revenue expansion</li>
//               <li>• <strong className="text-gray-300">YoY Profit</strong>: Bottom-line expansion</li>
//               <li className="pt-1 italic text-gray-500">Averaged & normalized.</li>
//             </ul>
//           </div>
//           <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50">
//             <h4 className="text-gray-200 font-bold text-sm mb-2">Investment Safety (20%)</h4>
//             <ul className="text-gray-400 text-xs space-y-1.5 leading-relaxed">
//               <li>• <strong className="text-gray-300">Debt/Equity (30%)</strong>: Leverage risk</li>
//               <li>• <strong className="text-gray-300">Current Ratio (25%)</strong>: Liquidity</li>
//               <li>• <strong className="text-gray-300">Interest Cov. (25%)</strong>: Debt service</li>
//               <li>• <strong className="text-gray-300">Gov. Flags (20%)</strong>: Risk indicators</li>
//             </ul>
//           </div>
//           <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50">
//             <h4 className="text-gray-200 font-bold text-sm mb-2">AI Composite (25%)</h4>
//             <p className="text-gray-400 text-xs leading-relaxed mb-2">Average of 4 proprietary AI signals:</p>
//             <ul className="text-gray-400 text-xs space-y-1 leading-relaxed">
//               <li>• Business Quality (BQ)</li>
//               <li>• Cyclicality (CY)</li>
//               <li>• Return Profile (RP) & Governance (BG)</li>
//             </ul>
//           </div>
//         </div>
//         <div className="bg-insight-blue/5 p-4 rounded-xl border border-insight-blue/10 flex flex-col md:flex-row gap-4">
//           <div className="flex-1">
//             <h4 className="text-insight-blue font-bold text-sm mb-1">Final Industry Score</h4>
//             <p className="text-gray-300 text-xs leading-relaxed">
//               All 5 dimensions (including a 15% weight for Stockholder Activity) are Z-score normalized separately, then weighted averaged, and re-normalized to a final -3 to +3 range. This ensures each industry gets a comparable score reflecting its overall health.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Constituents Table */}
//       {sortedCompanies.length > 0 && (
//         <section className="bg-insight-card rounded-xl border border-gray-800/60 overflow-hidden">
//           <div className="p-5 border-b border-gray-800 flex justify-between items-center">
//             <h2 className="text-sm uppercase tracking-widest text-gray-300 font-bold">Industry Leaderboard</h2>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left">
//               <thead>
//                 <tr className="bg-black/20 text-gray-500 text-xs uppercase tracking-widest">
//                   <th className="px-5 py-3 font-medium">Rank</th>
//                   <th className="px-5 py-3 font-medium">Company</th>
//                   <th className="px-5 py-3 font-medium">Status</th>
//                   <th className="px-5 py-3 font-medium">Fund. Score</th>
//                   <th className="px-5 py-3 font-medium text-insight-blue">Global Z-Score</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-800/50">
//                 {sortedCompanies.map((comp, idx) => {
//                   const statusTag = getInvestmentTag(comp.symbol, sectorEval?.rankings || data?.rankings || {});
//                   return (
//                     <tr key={comp.symbol} className="hover:bg-white/5 transition-colors">
//                       <td className="px-5 py-4 font-bold text-gray-400">
//                         #{idx + 1}
//                       </td>
//                       <td className="px-5 py-4">
//                         <Link to={`/company/${comp.symbol}`} className="font-bold text-gray-200 hover:text-insight-blue transition-colors">
//                           {comp.symbol}
//                         </Link>
//                       </td>
//                       <td className="px-5 py-4">
//                         <TagBadge label={statusTag} />
//                       </td>
//                       <td className="px-5 py-4 font-mono text-sm text-gray-300">
//                         {comp.fundamental_score ? Number(comp.fundamental_score).toFixed(2) : 'N/A'}
//                       </td>
//                       <td className={`px-5 py-4 font-mono font-bold text-sm ${getMetricColor(comp.z_score || comp.final_score)}`}>
//                         {formatZ(comp.z_score || comp.final_score)}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, ArrowRight, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { getInvestmentTag } from '../utils/getInvestmentTag';
import TagBadge from '../components/TagBadge';

export default function IndustryDashboard() {
  const { industry } = useParams();

  const [data, setData] = useState(null); 
  const [companies, setCompanies] = useState([]); 
  const [sectorEval, setSectorEval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAllIndustryData = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const encodedIndustry = encodeURIComponent(industry);

        const [industryRes, sectorRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/industry/${encodedIndustry}`),
          fetch(`${API_BASE_URL}/api/sector/${encodedIndustry}`)
        ]);

        if (!industryRes.ok && !sectorRes.ok) throw new Error('Industry data not found');

        const industryJson = industryRes.ok ? await industryRes.json() : {};
        const sectorJson = sectorRes.ok ? await sectorRes.json() : null;

        // =========================================================================
        // 100% BULLETPROOF SYNC: Extract companies directly from the Peer Evaluator output
        // =========================================================================
        let mappedCompanies = [];
        if (sectorJson && sectorJson.rankings && sectorJson.rankings.fundamental_investor) {
          // This array comes directly from peer_evaluator.py line 105
          mappedCompanies = sectorJson.rankings.fundamental_investor.map(c => ({
            symbol: c.company,
            fundamental_score: c.score,
            z_score: c.z_score,
            rank: c.rank
          }));
        }

        // Sort mathematically descending by Z-Score just to be absolutely certain
        mappedCompanies.sort((a, b) => {
          const scoreA = Number(a.z_score ?? a.fundamental_score ?? -999);
          const scoreB = Number(b.z_score ?? b.fundamental_score ?? -999);
          return scoreB - scoreA;
        });

        setData(industryJson);
        setCompanies(mappedCompanies); 
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

  // --- Formatting Helpers ---
  const formatZ = (val) => {
    if (val === null || val === undefined) return 'N/A';
    const num = Number(val);
    return num > 0 ? `+${num.toFixed(4)}` : num.toFixed(4); // 4 decimals matches Peer Comparison
  };

  const getMetricColor = (val) => {
    if (val === null || val === undefined) return 'text-gray-400';
    return Number(val) > 0 ? 'text-green-400' : 'text-red-400';
  };

  const getScore = (val) => (val !== null && val !== undefined ? val : null);

  const rawScores = data.normalized_scores || data.dimension_scores || {};
  const revHealth = getScore(rawScores.revenue_health) ?? data.leader_score; 
  const growth = getScore(rawScores.quarterly_growth) ?? data.depth_score;
  const invSafety = getScore(rawScores.investment_safety) ?? data.tail_score;
  const comp = getScore(rawScores.composite) ?? getScore(data.overall_industry_score) ?? data.final_industry_score;

  const chartData = [
    { name: 'Revenue', value: revHealth !== null ? Number(revHealth) : 0 },
    { name: 'Growth', value: growth !== null ? Number(growth) : 0 },
    { name: 'Safety', value: invSafety !== null ? Number(invSafety) : 0 },
    { name: 'Composite', value: comp !== null ? Number(comp) : 0 }
  ];

  // Guaranteed Top Company based on the exact same rankings array used in Peer Comparison
  const topCompany = companies.length > 0 ? companies[0] : null;
  
  let dynamicReason = "Top ranked company in sector based on global Z-score evaluation.";
  if (topCompany && sectorEval?.best_performing_company === topCompany.symbol) {
    dynamicReason = sectorEval.best_company_justification || dynamicReason;
  } else if (topCompany && topCompany.z_score !== undefined) {
    dynamicReason = `Mathematically ranked #1 in this sector driven by a Global Z-Score of ${formatZ(topCompany.z_score)}.`;
  }

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

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6 relative">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 tracking-tight">{(data.industry || industry).replace(/_/g, ' ')}</h1>
          <div className="flex items-center gap-4 mt-3">
            <span className="bg-insight-blue/10 text-insight-blue px-3 py-1 rounded-md text-sm font-bold border border-insight-blue/20">
              Rank #{data.industry_rank || data.rank || 'N/A'}
            </span>
            <span className="text-sm text-gray-400">
              Industry Z-Score: <span className={`font-mono font-bold ml-1 ${getMetricColor(comp)}`}>{formatZ(comp)}</span>
            </span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Revenue Health', val: revHealth },
          { label: 'Growth', val: growth },
          { label: 'Investment Safety', val: invSafety }
        ].map((metric, idx) => (
          <div key={idx} className="bg-insight-card border border-gray-800/60 p-5 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-xs tracking-widest uppercase font-bold mb-1">{metric.label}</h3>
              <p className={`text-2xl font-mono font-bold ${getMetricColor(metric.val)}`}>
                {metric.val !== null && metric.val !== undefined ? Number(metric.val) > 0 ? `+${Number(metric.val).toFixed(2)}` : Number(metric.val).toFixed(2) : 'N/A'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${Number(metric.val) > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {Number(metric.val) > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-insight-card p-6 rounded-xl border border-gray-800/60 shadow-sm relative">
          <div className="mb-6">
            <h2 className="text-sm uppercase tracking-widest text-gray-300 font-bold">Dimension Breakdown</h2>
            <p className="text-xs text-gray-500 mt-1">Z-Score standard deviations from market mean</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[-3, 3]} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} tickLine={false} axisLine={false} />
               <Tooltip
  // This is the "grey color" cursor that highlights the bar you are over
  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
  contentStyle={{ 
    backgroundColor: '#1f1f2e', // Lighter than pure black for visibility
    borderColor: '#444', 
    borderRadius: '8px', 
    color: '#fff', 
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
  }}
  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
  formatter={(value) => [Number(value) > 0 ? `+${Number(value).toFixed(2)}` : Number(value).toFixed(2), 'Z-Score']}
/>
                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#3b82f6' : '#ef4444'} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* TOP PERFORMING COMPANY SPOTLIGHT */}
        {topCompany && (
          <section className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 via-yellow-900/10 to-[#12121e] border border-yellow-500/30 p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-yellow-500 text-xs tracking-[0.2em] uppercase font-extrabold mb-3 flex items-center gap-2">
                <Trophy size={16} className="text-yellow-400" /> Top Performer
              </h2>
              
              <Link 
                to={`/company/${topCompany.symbol}`} 
                className="text-5xl font-extrabold text-white hover:text-yellow-400 transition-colors tracking-tight block mb-2"
              >
                {topCompany.symbol}
              </Link>

              <div className="flex items-center gap-3 mb-6">
                 <span className="text-sm text-gray-400">
                   Global Z-Score: <span className="font-mono font-bold text-gray-200">{formatZ(topCompany.z_score)}</span>
                 </span>
              </div>
              
              <div className="mt-2 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-yellow-500/10 w-full mb-6">
                <p className="text-gray-300 text-sm leading-relaxed">
                  <span className="font-bold text-yellow-500/90 mr-2 uppercase text-xs tracking-wider">AI Justification:</span>
                  {dynamicReason}
                </p>
              </div>
            </div>

            <Link 
              to={`/company/${topCompany.symbol}/peers`}
              className="group relative inline-flex items-center justify-center gap-2 py-3 px-6 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:text-yellow-300 rounded-xl font-bold transition-all duration-300 text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] mt-auto"
            >
              View Peer Leaderboard 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </section>
        )}
      </div>

      <section className="bg-insight-card p-6 rounded-xl border border-gray-800/60 shadow-sm">
        <h2 className="text-sm uppercase tracking-widest text-gray-300 font-bold mb-5 flex items-center gap-2">
          <Info size={16} className="text-insight-blue" />
          Understanding the Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50">
            <h4 className="text-gray-200 font-bold text-sm mb-2">Revenue Health (20%)</h4>
            <ul className="text-gray-400 text-xs space-y-1.5 leading-relaxed">
              <li>• <strong className="text-gray-300">OPM (30%)</strong>: Profit per dollar of sales</li>
              <li>• <strong className="text-gray-300">ROE (35%)</strong>: Profit relative to equity</li>
              <li>• <strong className="text-gray-300">ROCE (35%)</strong>: Capital return efficiency</li>
            </ul>
          </div>
          <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50">
            <h4 className="text-gray-200 font-bold text-sm mb-2">Growth (20%)</h4>
            <ul className="text-gray-400 text-xs space-y-1.5 leading-relaxed">
              <li>• <strong className="text-gray-300">YoY Sales</strong>: Revenue expansion</li>
              <li>• <strong className="text-gray-300">YoY Profit</strong>: Bottom-line expansion</li>
              <li className="pt-1 italic text-gray-500">Averaged & normalized.</li>
            </ul>
          </div>
          <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50">
            <h4 className="text-gray-200 font-bold text-sm mb-2">Investment Safety (20%)</h4>
            <ul className="text-gray-400 text-xs space-y-1.5 leading-relaxed">
              <li>• <strong className="text-gray-300">Debt/Equity (30%)</strong>: Leverage risk</li>
              <li>• <strong className="text-gray-300">Current Ratio (25%)</strong>: Liquidity</li>
              <li>• <strong className="text-gray-300">Interest Cov. (25%)</strong>: Debt service</li>
              <li>• <strong className="text-gray-300">Gov. Flags (20%)</strong>: Risk indicators</li>
            </ul>
          </div>
          <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50">
            <h4 className="text-gray-200 font-bold text-sm mb-2">AI Composite (25%)</h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-2">Average of 4 proprietary AI signals:</p>
            <ul className="text-gray-400 text-xs space-y-1 leading-relaxed">
              <li>• Business Quality (BQ)</li>
              <li>• Cyclicality (CY)</li>
              <li>• Return Profile (RP) & Governance (BG)</li>
            </ul>
          </div>
        </div>
        <div className="bg-insight-blue/5 p-4 rounded-xl border border-insight-blue/10 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <h4 className="text-insight-blue font-bold text-sm mb-1">Final Industry Score</h4>
            <p className="text-gray-300 text-xs leading-relaxed">
              All 5 dimensions are Z-score normalized separately, then weighted averaged, and re-normalized to a final -3 to +3 range. This ensures each industry gets a comparable score reflecting its overall health.
            </p>
          </div>
        </div>
      </section>

      {/* Constituents Table */}
      {/* {companies.length > 0 && (
        <section className="bg-insight-card rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-sm uppercase tracking-widest text-gray-300 font-bold">Industry Leaderboard</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/20 text-gray-500 text-xs uppercase tracking-widest">
                  <th className="px-5 py-3 font-medium">Rank</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Fund. Score</th>
                  <th className="px-5 py-3 font-medium text-insight-blue">Global Z-Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {companies.map((comp, idx) => {
                  const statusTag = getInvestmentTag(comp.symbol, sectorEval?.rankings || data?.rankings || {});
                  return (
                    <tr key={comp.symbol} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-bold text-gray-400">
                        #{idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/company/${comp.symbol}`} className="font-bold text-gray-200 hover:text-insight-blue transition-colors">
                          {comp.symbol}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <TagBadge label={statusTag} />
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-gray-300">
                        {comp.fundamental_score ? Number(comp.fundamental_score).toFixed(2) : 'N/A'}
                      </td>
                      <td className={`px-5 py-4 font-mono font-bold text-sm ${getMetricColor(comp.z_score)}`}>
                        {formatZ(comp.z_score)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )} */}
    </div>
  );
}