// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { ArrowLeft, Globe, TrendingUp } from 'lucide-react';
// import Table from '../components/Table';
// import { fetchIndexScores } from '../utils/dataFetcher';

// export default function IndexDashboard() {
//     const [indexData, setIndexData] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const loadIndexData = async () => {
//             try {
//                 const data = await fetchIndexScores();

//                 if (!data || !Array.isArray(data) || data.length === 0) {
//                     console.warn("No companies returned from API");
//                     setLoading(false);
//                     return;
//                 }

//                 // Map the data to fit the Table component's expected format
//                 const formattedData = data.map(item => ({
//                     name: item.symbol,
//                     // Fix the path here too
//                     year: (item.industry || item.business_overview?.industry_position || 'N/A').replace(/_/g, ' '),
//                     status: 'Active',
//                     score: item.fundamental_score ? parseFloat(item.fundamental_score).toFixed(2) : '0.00',
//                     val: item.z_score ? parseFloat(item.z_score).toFixed(4) : '0.0000'
//                 }));

//                 // Sort by Z-Score descending (Best overall companies first)
//                 formattedData.sort((a, b) => parseFloat(b.val) - parseFloat(a.val));

//                 setIndexData(formattedData);
//                 setLoading(false);
//             } catch (err) {
//                 console.error("Failed to fetch index scores:", err);
//                 setLoading(false);
//             }
//         };
//         loadIndexData();
//     }, []);

//     if (loading) return <div className="p-10 text-center text-gray-400">Loading Index Leaderboard...</div>;

//     if (!indexData || indexData.length === 0) {
//         return <div className="p-10 text-center text-gray-400">No companies data available. Please ensure the API is connected and MongoDB has company data.</div>;
//     }

//     return (
//         <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
//             <div className="flex items-center justify-between mb-2">
//                 <Link to="/" className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
//                     <ArrowLeft size={16} /> Back to Home
//                 </Link>
//             </div>

//             <header className="bg-insight-card p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
//                 <div className="relative z-10">
//                     <div className="flex items-center gap-3 mb-4">
//                         <div className="p-2 bg-insight-blue/20 rounded-lg text-insight-blue">
//                             <Globe size={24} />
//                         </div>
//                         <h1 className="text-3xl md:text-4xl font-bold text-gray-100">Whole Index Leaderboard</h1>
//                     </div>
//                     <p className="text-gray-400 max-w-2xl">
//                         A global comparison of all tracked companies standardized by <strong>Z-Score</strong>.
//                         This view eliminates sector bias, showing which companies are truly performing above the market average.
//                     </p>
//                 </div>
//                 <div className="absolute top-0 right-0 w-96 h-96 bg-insight-blue/5 rounded-full blur-[100px]" />
//             </header>

//             <section>
//                 <div className="flex items-center justify-between mb-6 px-1">
//                     <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
//                         <TrendingUp size={16} /> Global Rankings
//                     </h2>
//                     <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
//                         Total Companies: {indexData.length}
//                     </span>
//                 </div>

//                 {/* Reusing the Table component */}
//                 {/* Note: In this view, 'Year' column represents 'Industry' and 'Value' represents 'Z-Score' */}
//                 <Table data={indexData} />

//                 {/* <p className="mt-4 text-center text-xs text-gray-600">
//                     Note: Rankings are calculated using the Fundamental Final Score normalized across the entire index.
//                 </p> */}
//             </section>
//         </div>
//     );
// }



import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, TrendingUp } from 'lucide-react';
import Table from '../components/Table';
import { fetchIndexScores } from '../utils/dataFetcher';

export default function IndexDashboard() {
    const [indexData, setIndexData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadIndexData = async () => {
            try {
                const data = await fetchIndexScores();

                if (!data || !Array.isArray(data) || data.length === 0) {
                    console.warn("No companies returned from API");
                    setLoading(false);
                    return;
                }

                // Map the data to fit the Table component's expected format
                // formattedData mapping inside IndexDashboard.jsx
const formattedData = data.map(item => {
    const z = parseFloat(item.z_score || 0);
    
    let statusLabel = 'Neutral';
    // Bright Grey for Neutral
    let sColor = 'bg-gray-400/10 text-gray-300 border-gray-400/30'; 

    if (z > 0.5) {
        statusLabel = 'Alpha';
        // VIBRANT GREEN
        sColor = 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]';
    } else if (z < -0.5) {
        statusLabel = 'Beta';
        // VIBRANT RED
        sColor = 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
    }

    return {
        name: item.symbol,
        year: (item.industry || 'N/A').replace(/_/g, ' '),
        status: statusLabel,
        statusColor: sColor, 
        score: item.fundamental_score ? parseFloat(item.fundamental_score).toFixed(2) : '0.00',
        val: item.z_score ? parseFloat(item.z_score).toFixed(4) : '0.0000'
    };
});

                // Sort by Z-Score descending (Best overall companies first)
                formattedData.sort((a, b) => parseFloat(b.val) - parseFloat(a.val));

                setIndexData(formattedData);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch index scores:", err);
                setLoading(false);
            }
        };
        loadIndexData();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-400">Loading Index Leaderboard...</div>;

    if (!indexData || indexData.length === 0) {
        return <div className="p-10 text-center text-gray-400">No companies data available.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 fade-in">
            <div className="flex items-center justify-between mb-2">
                <Link to="/" className="text-gray-500 hover:text-insight-blue transition-colors flex items-center gap-2 text-sm font-medium">
                    <ArrowLeft size={16} /> Back to Home
                </Link>
            </div>

            <header className="bg-insight-card p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-insight-blue/20 rounded-lg text-insight-blue">
                            <Globe size={24} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-100">Whole Index Leaderboard</h1>
                    </div>
                    <p className="text-gray-400 max-w-2xl">
                        A global comparison standardized by <strong>Z-Score</strong>. 
                        Alpha represents market-beating fundamentals, while Neutral marks the index average.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-insight-blue/5 rounded-full blur-[100px]" />
            </header>

            <section>
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                        <TrendingUp size={16} /> Global Rankings
                    </h2>
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
                        Total Companies: {indexData.length}
                    </span>
                </div>

                <Table data={indexData} />

                {/* <div className="mt-8 bg-insight-blue/5 p-4 rounded-xl border border-insight-blue/10">
                    <p className="text-xs text-gray-500 leading-relaxed text-center">
                        <strong>Classification Math:</strong> <span className="text-green-400">Alpha</span> (Z {`>`} 0.5) | <span>Neutral</span> (-0.5 {`≤`} Z {`≤`} 0.5) | <span className="text-red-400">Underperform</span> (Z {`<`} -0.5)
                    </p>
                </div> */}
            </section>
        </div>
    );
}