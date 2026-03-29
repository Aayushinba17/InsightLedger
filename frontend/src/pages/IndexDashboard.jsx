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

//                 // Cleaned up map: Just the raw data, no arbitrary statuses
//                 const formattedData = data.map(item => {
//     return {
//         name: item.symbol,
//         industry: (item.industry || 'N/A').replace(/_/g, ' '),
//         score: item.fundamental_score ? parseFloat(item.fundamental_score).toFixed(2) : 'N/A',
//         val: item.z_score ? parseFloat(item.z_score).toFixed(4) : 'N/A'
//     };
// });

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
//         return <div className="p-10 text-center text-gray-400">No companies data available.</div>;
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
//                     {/* Cleaned up header description */}
//                     <p className="text-gray-400 max-w-2xl">
//                         A global comparison of all companies standardized by their <strong>Global Z-Score</strong> and Fundamental Score. Ranked from highest to lowest.
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

//                 <Table data={indexData} />
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


                const formattedData = data
    .filter(item => {
        const val = parseFloat(item.fundamental_score);
        return !isNaN(val) && val !== 0;
    })
    .map(item => {
        return {
            name: item.symbol,
            industry: (item.industry || 'N/A').replace(/_/g, ' '),
            score: parseFloat(item.fundamental_score).toFixed(2),
            val: !isNaN(parseFloat(item.z_score)) 
                ? parseFloat(item.z_score).toFixed(4) 
                : 'N/A'
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

    // ==========================================
    // ADDED: Define the columns for this specific table
    // ==========================================
    const indexColumns = [
        { 
            header: 'Company Name', 
            accessor: 'name',
            // Custom render function makes the symbol bold and white
            render: (row) => <span className="font-bold text-gray-100">{row.name}</span>
        },
        { 
            header: 'Industry', 
            accessor: 'industry' 
        },
        { 
            header: 'Fund. Score', 
            accessor: 'score',
            align: 'center',
            // Custom render function gives it a techy monospace font
            render: (row) => <span className="font-mono text-gray-300">{row.score}</span>
        },
        { 
            header: 'Global Z-Score', 
            accessor: 'val',
            align: 'center',
            // Custom render function makes the Z-score pop with insight-blue
            render: (row) => <span className="font-mono font-bold text-insight-blue">{row.val}</span>
        }
    ];
    // ==========================================

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
                    {/* Cleaned up header description */}
                    <p className="text-gray-400 max-w-2xl">
                        A global comparison of all companies standardized by their <strong>Global Z-Score</strong> and Fundamental Score. Ranked from highest to lowest.
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

                {/* ADDED: Pass the columns array into the Table component */}
                <Table columns={indexColumns} data={indexData} />
            </section>
        </div>
    );
}