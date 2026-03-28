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
              symbol: peer.company,
              year: new Date().getFullYear(),
              fundamental_score: companyData.fundamental_score || peer.score || 0,
              val_score: valueRank?.score || 0,
              gro_score: growthRank?.score || 0,
              saf_score: safetyRank?.score || 0,
              z_score: companyData.z_score || 0,
              business_quality_signals: {
                BQ: companyData.business_quality_signals?.BQ || 'N/A'
              },
              cyclicality_signals: {
                CY: companyData.cyclicality_signals?.CY || 'N/A'
              },
              return_profile_signals: {
                RP: companyData.return_profile_signals?.RP || 'N/A'
              },
              governance_signals: {
                BG: companyData.governance_signals?.BG || 'N/A'
              }
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

    const sorted = [...peerData].sort((a, b) => (b[activePersona === 'score' ? 'fundamental_score' : activePersona] || 0) - (a[activePersona === 'score' ? 'fundamental_score' : activePersona] || 0));

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
<section className="bg-insight-card p-6 rounded-2xl border border-gray-800 shadow-xl">
  <div className="mb-6">
    <h2 className="text-xl font-bold text-white">Peer Leaderboard</h2>
    <p className="text-gray-400 text-sm">Standardized fundamental comparison within the sector.</p>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-widest">
          <th className="px-4 py-4">Company</th>
          <th className="px-4 py-4">Status</th>
          <th className="px-4 py-4 text-insight-blue">Fundamental Score</th>
          <th className="px-4 py-4">Global Z-Score</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800">
        {displayData.map((comp) => (
          <tr key={comp.symbol} className="hover:bg-white/5 transition-colors">
            <td className="px-4 py-4 font-bold text-gray-100">{comp.symbol}</td>
            <td className="px-4 py-4">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${comp.status === 'Dash Pick' ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-400'}`}>
                {comp.status || 'Watchlist'}
              </span>
            </td>
            <td className="px-4 py-4 font-mono font-bold text-insight-blue">
              {comp.fundamental_score?.toFixed(2) || 'N/A'}
            </td>
            <td className="px-4 py-4 font-mono text-gray-300">
              {comp.z_score?.toFixed(4) || 'N/A'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>
  );
}