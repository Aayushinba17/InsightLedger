import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from '../components/Table';
import { ArrowLeft } from 'lucide-react';

const peerFiles = import.meta.glob('../../../data/peer_evaluations/*_evaluation.json', { eager: true });
const individualFiles = import.meta.glob('../../../data/qualitative_insights/*/*_individual.json', { eager: true });
const bqFiles = import.meta.glob('../../../data/qualitative_insights/*/business_quality_signals.json', { eager: true });
const cyFiles = import.meta.glob('../../../data/qualitative_insights/*/cyclicality_signals.json', { eager: true });
const rpFiles = import.meta.glob('../../../data/qualitative_insights/*/return_profile_signals.json', { eager: true });
const bgFiles = import.meta.glob('../../../data/qualitative_insights/*/governance_signals.json', { eager: true });

export default function PeerComparison() {
  const { symbol } = useParams();

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

    const hasScores = !!rawList.some(item => item.score !== undefined && item.score !== null);
    if (hasScores) {
      rawList.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else {
      rawList.sort((a, b) => {
        const aRank = a.rank !== undefined ? a.rank : 999;
        const bRank = b.rank !== undefined ? b.rank : 999;
        return aRank - bRank;
      });
    }

    const total = rawList.length;
    const top20Count = Math.ceil(total * 0.20);
    const mid50Count = Math.ceil(total * 0.50);

    return rawList.map((item, index) => {
      let status = 'Avoid';
      if (index < top20Count) {
        status = 'Dash Pick';
      } else if (index < top20Count + mid50Count) {
        status = 'Watchlist';
      }

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
        status: status,
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
      <div className="flex items-center justify-between mb-4">
        <Link to={`/company/${symbol}`} className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Peer Comparison</h1>
        <p className="text-gray-400 mt-2">Relative ranking of {symbol.toUpperCase()} against its industry peers</p>
      </header>

      {peerData.length > 0 ? (
        <Table data={peerData} />
      ) : (
        <div className="p-10 text-center text-gray-500 bg-insight-card rounded-xl border border-gray-800">
          No peer data available for {symbol.toUpperCase()}.
        </div>
      )}
    </div>
  );
}
