// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { fetchQualitativeAnalysis, fetchAllSectors } from '../utils/dataFetcher';
// import TagBadge from '../components/TagBadge';
// import ScoreCard from '../components/ScoreCard';
// import MetricCard from '../components/MetricCard';
// import ChartCard from '../components/ChartCard';
// import { ArrowLeft, Users, ArrowUpRight } from 'lucide-react';
// import { getInvestmentTag } from '../utils/getInvestmentTag';

// export default function CompanyDashboard() {
//   const { symbol } = useParams();
//   const [data, setData] = useState(null);
//   const [badgeLabel, setBadgeLabel] = useState('Watchlist');
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeNewsIdx, setActiveNewsIdx] = useState(null);

//   useEffect(() => {
//     setLoading(true);
//     const symbolUpper = symbol.toUpperCase();

//     // Fetch Company Data and All Sectors simultaneously from the API
//     Promise.all([
//       fetchQualitativeAnalysis(symbolUpper),
//       fetchAllSectors()
//     ])
//       .then(([companyRes, sectorsRes]) => {
//         setData(companyRes);

//         // --- NEW TAG LOGIC (Using API Data) ---
//         let label = 'Watchlist';
//         try {
//           const targetIndustry = sectorsRes.find(ind => 
//             ind?.rankings?.fundamental_investor?.some(c => c.company === symbolUpper)
//           );

//           if (targetIndustry && targetIndustry.rankings?.fundamental_investor) {
//             const rawList = [...targetIndustry.rankings.fundamental_investor];
//             const hasScores = !!rawList.some(item => item.score !== undefined && item.score !== null);

//             if (hasScores) {
//               rawList.sort((a, b) => (b.score || 0) - (a.score || 0));
//             } else {
//               rawList.sort((a, b) => (a.rank !== undefined ? a.rank : 999) - (b.rank !== undefined ? b.rank : 999));
//             }

//             const total = rawList.length;
//             const top20Count = Math.ceil(total * 0.20);
//             const mid50Count = Math.ceil(total * 0.50);
//             const computedIndex = rawList.findIndex(item => item.company === symbolUpper);

//             if (computedIndex !== -1) {
//               if (computedIndex < top20Count) label = 'Dash Pick';
//               else if (computedIndex < top20Count + mid50Count) label = 'Watchlist';
//               else label = 'Avoid';
//             }
//           }
//         } catch (err) {
//           console.error('Error calculating badge:', err);
//         }
//         setBadgeLabel(label);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error(err);
//         setError(`Failed to load data for ${symbol.toUpperCase()}.`);
//         setLoading(false);
//       });
//   }, [symbol]);

//   if (loading) return <div className="p-10 text-center text-gray-400">Loading Dashboard...</div>;
//   if (error || !data) return <div className="p-10 text-center text-red-400">{error || 'Data not found.'}</div>;

//   const {
//     business_overview,
//     business_quality_signals,
//     cyclicality_signals,
//     return_profile_signals,
//     governance_signals,
//     pros_and_cons,
//     quantitative_data
//   } = data;

//   const symbolUpper = symbol.toUpperCase();
//   const Scores = {
//     BQ: { 
//       val: business_quality_signals?.BQ, 
//       justification: business_quality_signals?.reasoning_points 
//     },
//     CY: { 
//       val: cyclicality_signals?.CY, 
//       justification: cyclicality_signals?.reasoning_points 
//     },
//     RP: { 
//       val: return_profile_signals?.RP, 
//       justification: return_profile_signals?.reasoning_points 
//     },
//     BG: { 
//       val: governance_signals?.BG, 
//       justification: governance_signals?.reasoning_points 
//     }
//   };

//   const Pros = pros_and_cons?.pros || [];
//   const Cons = pros_and_cons?.cons || [];

//   const recentMetrics = quantitative_data?.Recent || {};
//   const historical = quantitative_data?.Historical || {};
//   const recentNews = quantitative_data?.Recent_News || quantitative_data?.recent_news || [];

//   // --- MENTOR UPDATES: Fundamental Score & Contradiction Check ---
  
//   // 1. Extract the calculated scores from the backend (or fallback to manual average)
//   const fundamentalFinalScore = data.fundamental_score 
//     ? parseFloat(data.fundamental_score).toFixed(2) 
//     : (((Scores.BQ || 0) + (Scores.CY || 0) + (Scores.RP || 0) + (Scores.BG || 0)) / 4).toFixed(2);
    
//   const zScore = data.z_score ? parseFloat(data.z_score).toFixed(4) : null;

//   // 2. Check for Market Contradiction (Mentor point: "-ve returns contradict")
//   const return1Y = historical['Return over 1year'];
//   const isContradicting = fundamentalFinalScore > 70 && return1Y < 0;

//   const Chart_Data = [
//     { date: '5Y', value: historical['Return over 5years'] ? historical['Return over 5years'] * 100 : 0 },
//     { date: '3Y', value: historical['Return over 3years'] ? historical['Return over 3years'] * 100 : 0 },
//     { date: '1Y', value: historical['Return over 1year'] ? historical['Return over 1year'] * 100 : 0 }
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
//       {/* Navigation */}
//       <div className="flex items-center justify-between mb-2">
//         <Link to="/" className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
//           <ArrowLeft size={16} /> Back to Home
//         </Link>
//         <Link to={`/company/${symbol}/peers`} className="text-insight-purple hover:text-white transition-colors flex items-center gap-2 text-sm font-medium bg-insight-purple/10 px-4 py-2 rounded-full border border-insight-purple/30 shadow">
//           <Users size={16} /> Compare Peers
//         </Link>
//       </div>

//       {/* Header */}
//       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-insight-card p-6 rounded-2xl border border-gray-800 shadow relative overflow-hidden">
//         <div className="relative z-10 text-left">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-100">{symbolUpper}</h1>
//           <p className="text-gray-400 mt-1 flex items-center gap-3">
//             <span>{business_overview?.industry_position || 'Industry Leader'}</span>
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//   <TagBadge 
//     label={getInvestmentTag(symbolUpper, targetIndustry?.rankings || {})} 
//     className="text-lg px-4 py-1" 
//   />
// </div>
//         <div className="absolute top-0 right-0 w-64 h-64 bg-insight-blue/5 rounded-full blur-[80px]" />
//       </header>

//       {/* Score Cards Row */}
//       <section>
//         <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4 ml-1">Core AI Evaluation</h2>
//         <ScoreCard scores={Scores} />
//       </section>

//       {/* --- MENTOR UPDATES: Final Score & Contradiction Warning --- */}
//       <section className="flex flex-col md:flex-row gap-6 mb-8">
//         {/* Fundamental Final Score Box */}
//         <div className="bg-insight-blue/10 border border-insight-blue/30 p-6 rounded-2xl flex-1 flex flex-col items-center justify-center text-center shadow-lg">
//           <h3 className="text-insight-blue text-xs tracking-widest uppercase font-bold mb-2">Fundamental Final Score</h3>
//           <p className="text-5xl font-extrabold text-white">{fundamentalFinalScore}</p>
//           {zScore && (
//             <p className="text-sm text-gray-400 font-medium mt-3 bg-gray-900/50 px-3 py-1 rounded-full">
//               Global Z-Score: <span className="text-gray-200">{zScore}</span>
//             </p>
//           )}
//         </div>

//         {/* Contradiction Warning Box (Only shows if AI score is high but stock is crashing) */}
//         {(() => {
//   const aiScore = parseFloat(fundamentalFinalScore);
//   const oneYearReturn = historical['Return over 1year'] || 0;
//   const threeMonthReturn = historical['Return over 3months'] || 0;

//   let title = null;
//   let message = "";

//   if (aiScore > 75 && oneYearReturn < -8) {
//     title = "Market Contradiction";
//     message = `AI fundamentals are very strong (${aiScore.toFixed(2)}), but the stock has fallen sharply over the last 1 year (${(oneYearReturn * 100).toFixed(2)}%). Market may be pricing in macro headwinds or sector rotation.`;
//   } 
//   else if (aiScore < 55 && oneYearReturn > 20) {
//     title = "Market Optimism";
//     message = `AI scores are moderate (${aiScore.toFixed(2)}), yet the stock has risen strongly (${(oneYearReturn * 100).toFixed(2)}%). Market appears to be betting on future growth not yet visible in the annual report.`;
//   } 
//   else if (Math.abs(aiScore - (oneYearReturn * 100 + 50)) > 45) {
//     title = "Score-Price Divergence";
//     message = `AI score and market performance are significantly misaligned. External factors (macro, sentiment, sector news) may be dominating.`;
//   }

//   return title ? (
//     <div className="bg-red-950/30 border border-red-900/50 p-6 rounded-2xl flex-1 flex flex-col justify-center relative overflow-hidden">
//       <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px]" />
//       <h3 className="text-red-400 font-bold flex items-center gap-2 mb-3 text-lg relative z-10">
//         <span className="text-2xl">⚠️</span> {title}
//       </h3>
//       <p className="text-sm text-gray-300 leading-relaxed relative z-10">{message}</p>
//     </div>
//   ) : null;
// })()}
//       </section>

//       {/* Chart Section */}
//       <section className="relative">
//         <div className="flex items-center justify-between mb-4 px-1">
//           <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">Historical Return Trend (%)</h2>
//         </div>
//         <ChartCard data={Chart_Data} />
//       </section>

//       {/* Pros & Cons */}
//       {(Pros.length > 0 || Cons.length > 0) && (
//         <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="bg-green-950/20 border border-green-900/50 p-6 rounded-2xl shadow-inner shadow-green-900/10">
//             <h3 className="text-green-500 font-bold mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
//               <span className="w-2 h-2 rounded-full bg-green-500" /> Pros
//             </h3>
//             <ul className="space-y-3">
//               {Pros.map((pro, idx) => (
//                 <li key={idx} className="text-gray-300 text-sm leading-relaxed flex items-start gap-2">
//                   <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
//                   {pro}
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl shadow-inner shadow-red-900/10">
//             <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
//               <span className="w-2 h-2 rounded-full bg-red-500" /> Cons
//             </h3>
//             <ul className="space-y-3">
//               {Cons.map((con, idx) => (
//                 <li key={idx} className="text-gray-300 text-sm leading-relaxed flex items-start gap-2">
//                   <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
//                   {con}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </section>
//       )}

//       {/* Market Snapshot */}
//       <section>
//         <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4 ml-1">Market Snapshot</h2>
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//           {recentMetrics["Price to Earning"] !== null && recentMetrics["Price to Earning"] !== undefined && (
//             <MetricCard label="PE Ratio" value={recentMetrics["Price to Earning"]} />
//           )}
//           {recentMetrics["Return on equity"] !== null && recentMetrics["Return on equity"] !== undefined && (
//             <MetricCard label="ROE" value={(recentMetrics["Return on equity"] * 100).toFixed(2) + '%'} />
//           )}
//           {recentMetrics["Return on capital employed"] !== null && recentMetrics["Return on capital employed"] !== undefined && (
//             <MetricCard label="ROCE" value={(recentMetrics["Return on capital employed"] * 100).toFixed(2) + '%'} />
//           )}
//           {recentMetrics["Debt to equity"] !== null && recentMetrics["Debt to equity"] !== undefined && (
//             <MetricCard label="Debt/Equity" value={recentMetrics["Debt to equity"]} />
//           )}
//           {recentMetrics["Dividend yield"] !== null && recentMetrics["Dividend yield"] !== undefined && (
//             <MetricCard label="Dividend Yield" value={recentMetrics["Dividend yield"]} />
//           )}
//           {recentMetrics["EPS"] !== null && recentMetrics["EPS"] !== undefined && (
//             <MetricCard label="EPS" value={recentMetrics["EPS"]} />
//           )}
//           {recentMetrics["Sales growth"] !== null && recentMetrics["Sales growth"] !== undefined && (
//             <MetricCard label="Sales Growth" value={(recentMetrics["Sales growth"] * 100).toFixed(2) + '%'} />
//           )}
//           {recentMetrics["Profit growth"] !== null && recentMetrics["Profit growth"] !== undefined && (
//             <MetricCard label="Profit Growth" value={(recentMetrics["Profit growth"] * 100).toFixed(2) + '%'} />
//           )}
//         </div>
//       </section>

//       {/* Recent News */}
//       {recentNews.length > 0 && (
//         <section>
//           <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4 ml-1">Recent News</h2>
//           <div className="space-y-3">
//             {recentNews.map((item, idx) => (
//               <div
//                 key={`${item.link || item.title || 'news'}-${idx}`}
//                 className={`relative block overflow-hidden bg-insight-card p-4 rounded-xl border border-gray-800 transition-all duration-300 ${
//                   activeNewsIdx === idx
//                     ? 'shadow-lg shadow-insight-blue/20 -translate-y-0.5'
//                     : ''
//                 }`}
//               >
//                 <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 bg-gradient-to-r from-insight-blue/10 via-transparent to-insight-purple/10 ${
//                   activeNewsIdx === idx ? 'opacity-100' : 'opacity-0'
//                 }`} />
//                 <p className={`text-sm md:text-base font-medium leading-relaxed transition-colors duration-300 ${
//                   activeNewsIdx === idx ? 'text-insight-blue' : 'text-gray-100'
//                 }`}>
//                   {item.title || 'Untitled article'}
//                 </p>
//                 <div className="relative z-10 mt-3 flex items-center justify-between gap-3">
//                   <p className={`text-xs transition-colors duration-300 ${
//                     activeNewsIdx === idx ? 'text-gray-200' : 'text-gray-400'
//                   }`}>
//                     {item.publisher || 'Unknown publisher'}
//                   </p>
//                   <a
//                     href={item.link || '#'}
//                     target="_blank"
//                     rel="noreferrer noopener"
//                     onMouseEnter={() => setActiveNewsIdx(idx)}
//                     onMouseLeave={() => setActiveNewsIdx(null)}
//                     onFocus={() => setActiveNewsIdx(idx)}
//                     onBlur={() => setActiveNewsIdx(null)}
//                     className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-insight-blue hover:text-white bg-insight-blue/10 hover:bg-insight-blue px-2.5 py-1 rounded-full transition-colors duration-300"
//                   >
//                     Explore news
//                     <ArrowUpRight
//                       size={13}
//                       className={`transition-transform duration-300 ${
//                         activeNewsIdx === idx ? 'translate-x-0.5 -translate-y-0.5' : ''
//                       }`}
//                     />
//                   </a>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//     </div>
//   );
// }



import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchQualitativeAnalysis, fetchAllSectors } from '../utils/dataFetcher';
import TagBadge from '../components/TagBadge';
import ScoreCard from '../components/ScoreCard';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import { ArrowLeft, Users, ArrowUpRight } from 'lucide-react';
import { getInvestmentTag } from '../utils/getInvestmentTag';

export default function CompanyDashboard() {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [industryRankings, setIndustryRankings] = useState(null); // NEW: Save rankings to state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNewsIdx, setActiveNewsIdx] = useState(null);

  const symbolUpper = symbol.toUpperCase();

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetchQualitativeAnalysis(symbolUpper),
      fetchAllSectors()
    ])
      .then(([companyRes, sectorsRes]) => {
        setData(companyRes);

        // Find this company's industry to get peer rankings
        const targetIndustry = sectorsRes.find(ind => 
          ind?.rankings?.fundamental_investor?.some(c => c.company === symbolUpper)
        );

        if (targetIndustry && targetIndustry.rankings) {
          setIndustryRankings(targetIndustry.rankings);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(`Failed to load data for ${symbolUpper}.`);
        setLoading(false);
      });
  }, [symbolUpper]);

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

  const Scores = {
    BQ: { val: business_quality_signals?.BQ, justification: business_quality_signals?.reasoning_points },
    CY: { val: cyclicality_signals?.CY, justification: cyclicality_signals?.reasoning_points },
    RP: { val: return_profile_signals?.RP, justification: return_profile_signals?.reasoning_points },
    BG: { val: governance_signals?.BG, justification: governance_signals?.reasoning_points }
  };

  const Pros = pros_and_cons?.pros || [];
  const Cons = pros_and_cons?.cons || [];
  const recentMetrics = quantitative_data?.Recent || {};
  const historical = quantitative_data?.Historical || {};
  const recentNews = quantitative_data?.Recent_News || quantitative_data?.recent_news || [];

  // --- FUNDAMENTAL SCORES ---
  const fundamentalFinalScore = data.fundamental_score 
    ? parseFloat(data.fundamental_score).toFixed(2) 
    : (((Scores.BQ.val || 0) + (Scores.CY.val || 0) + (Scores.RP.val || 0) + (Scores.BG.val || 0)) / 4).toFixed(2);
    
  const zScore = data.z_score ? parseFloat(data.z_score).toFixed(4) : null;

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
          <ArrowLeft size={16} /> Back to Home
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
        <div className="flex items-center gap-3 relative z-10">
          {/* DYNAMIC TAG INJECTION HERE */}
          <TagBadge 
            label={getInvestmentTag(symbolUpper, industryRankings)} 
            className="text-lg px-4 py-1" 
          />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-insight-blue/5 rounded-full blur-[80px]" />
      </header>

      {/* Score Cards Row */}
      <section>
        <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4 ml-1">Core AI Evaluation</h2>
        <ScoreCard scores={Scores} />
      </section>

      {/* Final Score & Contradiction Warning */}
      <section className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="bg-insight-blue/10 border border-insight-blue/30 p-6 rounded-2xl flex-1 flex flex-col items-center justify-center text-center shadow-lg">
          <h3 className="text-insight-blue text-xs tracking-widest uppercase font-bold mb-2">Fundamental Final Score</h3>
          <p className="text-5xl font-extrabold text-white">{fundamentalFinalScore}</p>
          {zScore && (
            <p className="text-sm text-gray-400 font-medium mt-3 bg-gray-900/50 px-3 py-1 rounded-full">
              Global Z-Score: <span className="text-gray-200">{zScore}</span>
            </p>
          )}
        </div>

        {/* --- DYNAMIC MARKET CONTRADICTION --- */}
        {(() => {
          const aiScore = parseFloat(fundamentalFinalScore);
          const oneYearReturn = historical['Return over 1year'] || 0;

          let title = null;
          let message = "";

          if (aiScore > 75 && oneYearReturn < -0.05) {
            title = "Market Contradiction";
            
            // Fetch a GENUINE negative reason from the company's AI data
            const primaryRisk = Cons[0] || 
                                data?.risk_analysis?.industry_risks?.[0]?.risk || 
                                data?.risk_analysis?.operational_risks?.[0]?.risk || 
                                "undisclosed sector headwinds";

            message = `AI fundamentals are strong (${aiScore.toFixed(2)}), but the stock has dropped ${(oneYearReturn * 100).toFixed(2)}% over 1 year. The market may be heavily discounting the stock due to concerns regarding: "${primaryRisk}".`;
          } 
          else if (aiScore < 55 && oneYearReturn > 0.15) {
            title = "Market Optimism";
            
            // Fetch a GENUINE positive reason from the company's AI data
            const primaryCatalyst = Pros[0] || 
                                    data?.return_profile_signals?.structural_growth_drivers?.[0] || 
                                    data?.return_profile_signals?.new_business_optionalities?.[0] || 
                                    "future growth expectations";

            message = `AI baseline scores are moderate (${aiScore.toFixed(2)}), yet the stock has rallied ${(oneYearReturn * 100).toFixed(2)}% over 1 year. Investors appear to be looking past current fundamentals, betting heavily on: "${primaryCatalyst}".`;
          } 
          else if (Math.abs(aiScore - (oneYearReturn * 100 + 50)) > 45) {
            title = "Score-Price Divergence";
            
            const divergenceReason = Cons[0] ? `Take a closer look at risks like: "${Cons[0]}"` : "Consider reviewing the Risk Analysis section.";
            message = `The fundamental score (${aiScore.toFixed(2)}) diverges significantly from the recent market trend. ${divergenceReason}`;
          }

          return title ? (
            <div className="bg-red-950/30 border border-red-900/50 p-6 rounded-2xl flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px]" />
              <h3 className="text-red-400 font-bold flex items-center gap-2 mb-3 text-lg relative z-10">
                <span className="text-2xl">⚠️</span> {title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed relative z-10">{message}</p>
            </div>
          ) : null;
        })()}
      </section>

      {/* Chart Section */}
      <section className="relative">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">Historical Trends (%)</h2>
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
          {recentMetrics["Price to Earning"] !== null && recentMetrics["Price to Earning"] !== undefined && (
            <MetricCard label="PE Ratio" value={recentMetrics["Price to Earning"]} />
          )}
          {recentMetrics["Return on equity"] !== null && recentMetrics["Return on equity"] !== undefined && (
            <MetricCard label="ROE" value={(recentMetrics["Return on equity"] * 100).toFixed(2) + '%'} />
          )}
          {recentMetrics["Return on capital employed"] !== null && recentMetrics["Return on capital employed"] !== undefined && (
            <MetricCard label="ROCE" value={(recentMetrics["Return on capital employed"] * 100).toFixed(2) + '%'} />
          )}
          {recentMetrics["Debt to equity"] !== null && recentMetrics["Debt to equity"] !== undefined && (
            <MetricCard label="Debt/Equity" value={recentMetrics["Debt to equity"]} />
          )}
          {recentMetrics["Dividend yield"] !== null && recentMetrics["Dividend yield"] !== undefined && (
            <MetricCard label="Dividend Yield" value={recentMetrics["Dividend yield"]} />
          )}
          {recentMetrics["EPS"] !== null && recentMetrics["EPS"] !== undefined && (
            <MetricCard label="EPS" value={recentMetrics["EPS"]} />
          )}
          {recentMetrics["Sales growth"] !== null && recentMetrics["Sales growth"] !== undefined && (
            <MetricCard label="Sales Growth" value={(recentMetrics["Sales growth"] * 100).toFixed(2) + '%'} />
          )}
          {recentMetrics["Profit growth"] !== null && recentMetrics["Profit growth"] !== undefined && (
            <MetricCard label="Profit Growth" value={(recentMetrics["Profit growth"] * 100).toFixed(2) + '%'} />
          )}
        </div>
      </section>
    </div>
  );
}