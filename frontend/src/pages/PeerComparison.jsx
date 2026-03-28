import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchAllSectors, fetchQualitativeAnalysis } from '../utils/dataFetcher';

export default function PeerComparison() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState('score');
  
  const [peerData, setPeerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const symbolUpper = symbol.toUpperCase();

    // 1. Fetch all sectors to find where this company belongs
    fetchAllSectors().then(async (sectors) => {
      const foundIndustry = sectors.find(ind => 
        ind?.rankings?.fundamental_investor?.some(c => c.company === symbolUpper)
      );

      if (!foundIndustry || !foundIndustry.rankings?.fundamental_investor) {
        setLoading(false);
        return;
      }

      const rawPeers = foundIndustry.rankings.fundamental_investor;

      // 2. Fetch individual company details to get BQ, CY, RP, BG scores
      const detailedPeers = await Promise.all(
        rawPeers.map(async (peer) => {
          try {
            const companyData = await fetchQualitativeAnalysis(peer.company);
            const valueRank = foundIndustry.rankings.value_investor?.find(c => c.company === peer.company);
            const growthRank = foundIndustry.rankings.growth_investor?.find(c => c.company === peer.company);
            const safetyRank = foundIndustry.rankings.safety_investor?.find(c => c.company === peer.company);

            return {
              name: peer.company,
              year: new Date().getFullYear(),
              score: peer.score || 0,
              val: valueRank?.score || 0,
              gro: growthRank?.score || 0,
              saf: safetyRank?.score || 0,
              bq: companyData.business_quality_signals?.BQ || null,
              cy: companyData.cyclicality_signals?.CY || null,
              rp: companyData.return_profile_signals?.RP || null,
              bg: companyData.governance_signals?.BG || null
            };
          } catch (err) {
            console.error(`Failed to fetch details for peer ${peer.company}`);
            return null; // Skip if fails
          }
        })
      );

      setPeerData(detailedPeers.filter(Boolean));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [symbol]);

  const displayData = useMemo(() => {
    if (!peerData.length) return [];

    const sorted = [...peerData].sort((a, b) => (b[activePersona] || 0) - (a[activePersona] || 0));

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

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Peer Comparison...</div>;

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
          
          <div onClick={() => setActivePersona('score')} className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${activePersona === 'score' ? 'bg-[#25253b] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-[#151521] border-gray-800/50 hover:border-gray-600'}`}>
            <h4 className={`font-bold text-sm mb-1 ${activePersona === 'score' ? 'text-indigo-300' : 'text-indigo-400'}`}>FUNDAMENTAL (GARP)</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Balances quality and price.</p>
          </div>

          <div onClick={() => setActivePersona('val')} className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${activePersona === 'val' ? 'bg-[#25253b] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-[#151521] border-gray-800/50 hover:border-gray-600'}`}>
            <h4 className={`font-bold text-sm mb-1 ${activePersona === 'val' ? 'text-indigo-300' : 'text-indigo-400'}`}>VALUE INVESTOR</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Hunts for underpriced assets.</p>
          </div>

          <div onClick={() => setActivePersona('gro')} className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${activePersona === 'gro' ? 'bg-[#25253b] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-[#151521] border-gray-800/50 hover:border-gray-600'}`}>
            <h4 className={`font-bold text-sm mb-1 ${activePersona === 'gro' ? 'text-indigo-300' : 'text-indigo-400'}`}>GROWTH INVESTOR</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Seeks aggressive expansion.</p>
          </div>

          <div onClick={() => setActivePersona('saf')} className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${activePersona === 'saf' ? 'bg-[#25253b] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-[#151521] border-gray-800/50 hover:border-gray-600'}`}>
            <h4 className={`font-bold text-sm mb-1 ${activePersona === 'saf' ? 'text-indigo-300' : 'text-indigo-400'}`}>SAFETY INVESTOR</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Prioritizes capital preservation.</p>
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
                  <tr key={company.name} onClick={() => navigate(`/company/${company.name}`)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="py-4 px-6 font-bold text-gray-100 group-hover:text-indigo-400 transition-colors">{company.name}</td>
                    <td className="py-4 px-4 text-gray-400">{company.year}</td>
                    <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-xs font-medium border ${company.tagColors}`}>{company.status}</span></td>
                    <td className="py-4 px-4 font-bold text-indigo-300">
                      {activePersona === 'score' && company.score.toFixed(4)}
                      {activePersona === 'val' && company.val.toFixed(4)}
                      {activePersona === 'gro' && company.gro.toFixed(4)}
                      {activePersona === 'saf' && company.saf.toFixed(4)}
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