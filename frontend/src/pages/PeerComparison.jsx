import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // 🟢 Added useNavigate
import { ArrowLeft } from 'lucide-react';

const peerFiles = import.meta.glob('../../../data/peer_evaluations/*_evaluation.json', { eager: true });
const individualFiles = import.meta.glob('../../../data/qualitative_insights/*/*_individual.json', { eager: true });
const bqFiles = import.meta.glob('../../../data/qualitative_insights/*/business_quality_signals.json', { eager: true });
const cyFiles = import.meta.glob('../../../data/qualitative_insights/*/cyclicality_signals.json', { eager: true });
const rpFiles = import.meta.glob('../../../data/qualitative_insights/*/return_profile_signals.json', { eager: true });
const bgFiles = import.meta.glob('../../../data/qualitative_insights/*/governance_signals.json', { eager: true });

export default function PeerComparison() {
  const { symbol } = useParams();
  const navigate = useNavigate(); // 🟢 Initialized the navigation hook
  
  // State to track which Tab is active (Default: SCORE/Fundamental)
  const [activePersona, setActivePersona] = useState('score'); 

  const peerData = useMemo(() => {
    let rawList = [];
    let foundIndustry = null;
    try {
      let allIndustries = Object.values(peerFiles).map((mod) => mod.default || mod);
      
      foundIndustry = allIndustries.find(ind => 
        ind.rankings?.fundamental_investor?.some(c => c.company === symbol.toUpperCase())
      );

      if (foundIndustry && foundIndustry.rankings?.fundamental_investor) {
        rawList = [...foundIndustry.rankings.fundamental_investor];
      }
    } catch (e) {
      console.error(e);
    }

    if (!rawList.length) return [];

    return rawList.map((item) => {
      const indPath = `../../../data/qualitative_insights/${item.company}/${item.company}_individual.json`;
      const indData = individualFiles[indPath]?.default || individualFiles[indPath];

      const bqPath = `../../../data/qualitative_insights/${item.company}/business_quality_signals.json`;
      const cyPath = `../../../data/qualitative_insights/${item.company}/cyclicality_signals.json`;
      const rpPath = `../../../data/qualitative_insights/${item.company}/return_profile_signals.json`;
      const bgPath = `../../../data/qualitative_insights/${item.company}/governance_signals.json`;

      const bqData = indData?.business_quality_signals || bqFiles[bqPath]?.default || bqFiles[bqPath];
      const cyData = indData?.cyclicality_signals || cyFiles[cyPath]?.default || cyFiles[cyPath];
      const rpData = indData?.return_profile_signals || rpFiles[rpPath]?.default || rpFiles[rpPath];
      const bgData = indData?.governance_signals || bgFiles[bgPath]?.default || bgFiles[bgPath];

      const valueRank = foundIndustry?.rankings?.value_investor?.find(c => c.company === item.company);
      const growthRank = foundIndustry?.rankings?.growth_investor?.find(c => c.company === item.company);
      const safetyRank = foundIndustry?.rankings?.safety_investor?.find(c => c.company === item.company);

      return {
        name: item.company || 'Unknown',
        year: new Date().getFullYear(),
        score: item.score !== undefined ? item.score : null, 
        val: valueRank?.score !== undefined ? valueRank.score : null, 
        gro: growthRank?.score !== undefined ? growthRank.score : null, 
        saf: safetyRank?.score !== undefined ? safetyRank.score : null, 
        bq: bqData?.BQ !== undefined ? bqData.BQ : null,
        cy: cyData?.CY !== undefined ? cyData.CY : null,
        rp: rpData?.RP !== undefined ? rpData.RP : null,
        bg: bgData?.BG !== undefined ? bgData.BG : null
      };
    });
  }, [symbol]);

  const displayData = useMemo(() => {
    if (!peerData.length) return [];

    const sorted = [...peerData].sort((a, b) => {
      const valA = a[activePersona] || 0;
      const valB = b[activePersona] || 0;
      return valB - valA; 
    });

    const total = sorted.length;
    const topCount = Math.max(1, Math.ceil(total * 0.20)); 
    const midCount = Math.max(1, Math.ceil(total * 0.50));

    return sorted.map((item, index) => {
      let status = 'Avoid';
      let tagColors = 'bg-red-900/30 text-red-500 border-red-800';
      
      if (index < topCount) {
        status = 'Dash Pick';
        tagColors = 'bg-green-900/30 text-green-500 border-green-800';
      } else if (index < topCount + midCount) {
        status = 'Watchlist';
        tagColors = 'bg-blue-900/40 text-blue-400 border-blue-800';
      }
      
      return { ...item, status, tagColors };
    });
  }, [peerData, activePersona]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 fade-in">
      <div className="flex items-center justify-between mb-4">
        <Link to={`/company/${symbol}`} className="text-gray-500 hover:text-indigo-400 transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Peer Comparison</h1>
        <p className="text-gray-400 mt-2">Relative ranking of {symbol.toUpperCase()} against its industry peers</p>
      </header>

      {/* THE INTERACTIVE TABS */}
      <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-5 mb-6">
        <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Select Your Investor Perspective</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => setActivePersona('score')}
            className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${activePersona === 'score' ? 'bg-[#25253b] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-[#151521] border-gray-800/50 hover:border-gray-600'}`}
          >
            <h4 className={`font-bold text-sm mb-1 ${activePersona === 'score' ? 'text-indigo-300' : 'text-indigo-400'}`}>FUNDAMENTAL (GARP)</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Balances quality and price. Weighs Business Quality (BQ) against valuation.</p>
          </div>

          <div 
            onClick={() => setActivePersona('val')}
            className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${activePersona === 'val' ? 'bg-[#25253b] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-[#151521] border-gray-800/50 hover:border-gray-600'}`}
          >
            <h4 className={`font-bold text-sm mb-1 ${activePersona === 'val' ? 'text-indigo-300' : 'text-indigo-400'}`}>VALUE INVESTOR</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Hunts for underpriced assets. Heavily prioritizes the lowest P/E Ratios.</p>
          </div>

          <div 
            onClick={() => setActivePersona('gro')}
            className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${activePersona === 'gro' ? 'bg-[#25253b] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-[#151521] border-gray-800/50 hover:border-gray-600'}`}
          >
            <h4 className={`font-bold text-sm mb-1 ${activePersona === 'gro' ? 'text-indigo-300' : 'text-indigo-400'}`}>GROWTH INVESTOR</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Seeks aggressive expansion. Maximizes Return Profile (RP) and YoY Sales.</p>
          </div>

          <div 
            onClick={() => setActivePersona('saf')}
            className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${activePersona === 'saf' ? 'bg-[#25253b] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-[#151521] border-gray-800/50 hover:border-gray-600'}`}
          >
            <h4 className={`font-bold text-sm mb-1 ${activePersona === 'saf' ? 'text-indigo-300' : 'text-indigo-400'}`}>SAFETY INVESTOR</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Prioritizes capital preservation. Rewards Governance (BG) and low Cyclicality.</p>
          </div>

        </div>
      </div>

      {/* THE STREAMLINED TABLE */}
      {displayData.length > 0 ? (
        <div className="bg-[#1e1e2d] rounded-xl overflow-hidden border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b border-gray-800 bg-[#1e1e2d]">
                <tr>
                  <th className="py-4 px-6 font-semibold text-gray-400">COMPANY NAME</th>
                  <th className="py-4 px-4 font-semibold text-gray-400">YEAR</th>
                  <th className="py-4 px-4 font-semibold text-gray-400">STATUS</th>
                  
                  {/* DYNAMIC HEADER */}
                  <th className="py-4 px-4 font-bold text-indigo-400">
                    {activePersona === 'score' && 'FUNDAMENTAL SCORE'}
                    {activePersona === 'val' && 'VALUE SCORE'}
                    {activePersona === 'gro' && 'GROWTH SCORE'}
                    {activePersona === 'saf' && 'SAFETY SCORE'}
                  </th>

                  <th className="py-4 px-4 font-semibold text-gray-400">BQ</th>
                  <th className="py-4 px-4 font-semibold text-gray-400">CY</th>
                  <th className="py-4 px-4 font-semibold text-gray-400">RP</th>
                  <th className="py-4 px-6 font-semibold text-gray-400">BG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {displayData.map((company) => (
                  // 🟢 THE FIX: The entire row is now a clickable button using onClick & navigate
                  <tr 
                    key={company.name} 
                    onClick={() => navigate(`/company/${company.name}`)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    
                    {/* The text inside will light up blue when the row is hovered thanks to 'group-hover' */}
                    <td className="py-4 px-6 font-bold text-gray-100 group-hover:text-indigo-400 transition-colors">
                      {company.name}
                    </td>

                    <td className="py-4 px-4 text-gray-400">{company.year}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${company.tagColors}`}>
                        {company.status}
                      </span>
                    </td>
                    
                    {/* DYNAMIC DATA */}
                    <td className="py-4 px-4 font-bold text-indigo-300">
                      {activePersona === 'score' && (company.score || 0).toFixed(4)}
                      {activePersona === 'val' && (company.val || 0).toFixed(4)}
                      {activePersona === 'gro' && (company.gro || 0).toFixed(4)}
                      {activePersona === 'saf' && (company.saf || 0).toFixed(4)}
                    </td>

                    <td className="py-4 px-4 text-gray-300">{company.bq ? company.bq.toFixed(2) : '-'}</td>
                    <td className="py-4 px-4 text-gray-300">{company.cy ? company.cy.toFixed(2) : '-'}</td>
                    <td className="py-4 px-4 text-gray-300">{company.rp ? company.rp.toFixed(2) : '-'}</td>
                    <td className="py-4 px-6 text-gray-300">{company.bg ? company.bg.toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center text-gray-500 bg-[#1e1e2d] rounded-xl border border-gray-800">
          No peer data available for {symbol.toUpperCase()}.
        </div>
      )}
    </div>
  );
}