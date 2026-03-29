// import React, { useState } from 'react';

// const SCORE_META = {
//   BQ: {
//     label: 'Business Quality',
//     description: 'Moat, pricing power, scalability',
//     borderColor: 'border-insight-blue/60',
//     bgColor: 'bg-insight-blue/20',
//     textColor: 'text-insight-blue',
//   },
//   RP: {
//     label: 'Return Profile',
//     description: 'ROE, ROCE, capital efficiency',
//     borderColor: 'border-insight-blue/60',
//     bgColor: 'bg-insight-blue/20',
//     textColor: 'text-insight-blue',
//   },
//   CY: {
//     label: 'Cyclicality',
//     description: 'Revenue stability, demand sensitivity',
//     borderColor: 'border-insight-blue/60',
//     bgColor: 'bg-insight-blue/20',
//     textColor: 'text-insight-blue',
//   },
//   BG: {
//     label: 'Governance',
//     description: 'Management quality, transparency',
//     borderColor: 'border-insight-blue/60',
//     bgColor: 'bg-insight-blue/20',
//     textColor: 'text-insight-blue',
//   },
// };

// // /**
// //  * Returns a label based on the numeric score (out of 10).
// //  */
// // function scoreLabel(val) {
// //   if (val == null) return '—';
// //   if (val >= 8) return 'Excellent';
// //   if (val >= 6) return 'Good';
// //   if (val >= 4) return 'Moderate';
// //   return 'Weak';
// // }

// // /**
// //  * A thin horizontal bar representing score / 10.
// //  */
// // function ScoreBar({ val, accentColor }) {
// //   const pct = val != null ? Math.min(Math.max((val / 10) * 100, 0), 100) : 0;
// //   return (
// //     <div className="w-full h-1 rounded-full bg-gray-800 overflow-hidden mt-3">
// //       <div
// //         className="h-full rounded-full transition-all duration-500"
// //         style={{ width: `${pct}%`, backgroundColor: accentColor }}
// //       />
// //     </div>
// //   );
// // }

// /**
//  * Single score card — shows value, label, bar, and collapsible reasoning points.
//  */
// function ScoreItem({ scoreKey, score }) {
//   const [open, setOpen] = useState(false);
//   const meta = SCORE_META[scoreKey];
//   const { val, justification } = score;
//   const hasPoints = Array.isArray(justification) && justification.length > 0;

//   return (
//     <div
//       className={`rounded-xl border ${meta.borderColor} ${meta.bgColor} p-5 flex flex-col gap-3 transition-shadow duration-200 hover:shadow-md`}
//     >
//       {/* Header row */}
//       <div className="flex items-start justify-between gap-2">
//         <div>
//           <p className={`text-xs font-bold uppercase tracking-widest ${meta.textColor}`}>
//             {scoreKey}
//           </p>
//           <p className="text-gray-300 font-semibold text-sm mt-0.5">{meta.label}</p>
//           <p className="text-gray-500 text-xs mt-0.5">{meta.description}</p>
//         </div>

//         {/* Score value badge */}
//         <div className="shrink-0 text-right">
//           <p className="text-2xl font-extrabold text-gray-100 leading-none">
//             {val != null ? val : '—'}
//           </p>
//           {/* <p className={`text-xs font-medium mt-0.5 ${meta.textColor}`}>
//             {scoreLabel(val)}
//           </p> */}
//         </div>
//       </div>

//       {/* Score bar
//       <ScoreBar val={val} accentColor={meta.accentColor} /> */}

//       {/* Collapsible reasoning points */}
//       {hasPoints && (
//         <div>
//           <button
//             onClick={() => setOpen(o => !o)}
//             className={`text-xs font-medium ${meta.textColor} hover:opacity-80 transition-opacity flex items-center gap-1 mt-1`}
//           >
//             {open ? '▲ Hide reasoning' : '▼ View reasoning'}
//           </button>
//           {open && (
//             <ul className="mt-2 space-y-2">
//               {justification.map((point, idx) => (
//                 <li key={idx} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
//                   <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotColor}`} />
//                   {point}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// /**
//  * ScoreCard — renders a 2×2 grid of BQ, RP, CY, BG score cards.
//  */
// export default function ScoreCard({ scores }) {
//   if (!scores) return null;

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//       {Object.entries(scores).map(([key, score]) =>
//         SCORE_META[key] ? (
//           <ScoreItem key={key} scoreKey={key} score={score} />
//         ) : null
//       )}
//     </div>
//   );
// }



/**
 * ScoreCard.jsx
 *
 * FINAL VERSION (March 2026)
 * • Uses the exact score card design you provided (compact header with small BQ/RP/CY/BG label,
 *   description, and score value).
 * • All 4 cards are uniformly styled with insight-blue theme (as requested earlier).
 * • Coloured accent bar completely removed.
 * • Dropdown changed to the overlapping absolute style you requested:
 *   - Trigger button at the bottom (no card expansion / no layout shift).
 *   - Dropdown appears below the card as a separate floating panel.
 *   - Uses the same visual style as the last inline version you liked.
 */

import React, { useState } from 'react';

const SCORE_META = {
  BQ: {
    label: 'Business Quality',
    description: 'Moat, pricing power, scalability',
    borderColor: 'border-insight-blue/60',
    bgColor: 'bg-insight-blue/20',
    textColor: 'text-insight-blue',
  },
  RP: {
    label: 'Return Profile',
    description: 'ROE, ROCE, capital efficiency',
    borderColor: 'border-insight-blue/60',
    bgColor: 'bg-insight-blue/20',
    textColor: 'text-insight-blue',
  },
  CY: {
    label: 'Cyclicality',
    description: 'Revenue stability, demand sensitivity',
    borderColor: 'border-insight-blue/60',
    bgColor: 'bg-insight-blue/20',
    textColor: 'text-insight-blue',
  },
  BG: {
    label: 'Governance',
    description: 'Management quality, transparency',
    borderColor: 'border-insight-blue/60',
    bgColor: 'bg-insight-blue/20',
    textColor: 'text-insight-blue',
  },
};

/**
 * Single score card with overlapping dropdown reasoning.
 */
function ScoreItem({ scoreKey, score }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const meta = SCORE_META[scoreKey];
  const { val, justification } = score;
  const hasPoints = Array.isArray(justification) && justification.length > 0;

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={`rounded-2xl border ${meta.borderColor} ${meta.bgColor} p-6 relative overflow-visible shadow transition-shadow hover:shadow-md`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest ${meta.textColor}`}>
            {scoreKey}
          </p>
          <p className="text-gray-300 font-semibold text-sm mt-0.5">{meta.label}</p>
          <p className="text-gray-500 text-xs mt-0.5">{meta.description}</p>
        </div>

        {/* Score value */}
        <div className="shrink-0 text-right">
          <p className={`text-3xl font-extrabold ${meta.textColor} leading-none`}>
            {val != null ? val : '—'}
          </p>
        </div>
      </div>

      {/* Dropdown trigger – always visible at bottom */}
      {hasPoints && (
        <button
          onClick={toggleExpanded}
          className={`flex w-full items-center justify-between ${meta.textColor} hover:text-white font-medium text-sm border-t border-gray-700/50 pt-4 mt-6 transition-colors`}
        >
          <span>View reasoning</span>
          <span
            className={`inline-block text-lg transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>
      )}

      {/* Overlapping dropdown – attached to lower box, no layout shift */}
      {isExpanded && hasPoints && (
        <div className="absolute left-0 right-0 top-full mt-3 z-30 bg-insight-card border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <ul className="space-y-3 text-sm text-gray-300">
            {justification.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-insight-blue text-base mt-px">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * ScoreCard — renders a 2×2 grid of the 4 score cards.
 */
export default function ScoreCard({ scores }) {
  if (!scores) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {Object.entries(scores).map(([key, score]) =>
        SCORE_META[key] ? (
          <ScoreItem key={key} scoreKey={key} score={score} />
        ) : null
      )}
    </div>
  );
}