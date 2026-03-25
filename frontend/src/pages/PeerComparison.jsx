import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from '../components/Table';
import { ArrowLeft } from 'lucide-react';

const peerFiles = import.meta.glob('../../../data/peer_evaluations/*_evaluation.json', { eager: true });

export default function PeerComparison() {
  const { symbol } = useParams();

  const peerData = useMemo(() => {
    let rawList = [];
    try {
      let allIndustries = Object.values(peerFiles).map((mod) => mod.default || mod);
      
      let targetIndustry = allIndustries.find(ind => 
        ind.rankings?.fundamental_investor?.some(c => c.company === symbol.toUpperCase())
      );

      if (targetIndustry && targetIndustry.rankings?.fundamental_investor) {
        rawList = [...targetIndustry.rankings.fundamental_investor];
      }
    } catch (e) {
      console.error(e);
    }

    if (!rawList.length) return [];

    rawList.sort((a, b) => (b.score || 0) - (a.score || 0));

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

      return {
        name: item.company || 'Unknown',
        year: new Date().getFullYear(),
        status: status,
        fileLink: null
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
