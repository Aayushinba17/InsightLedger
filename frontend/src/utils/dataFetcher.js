export async function fetchIndustrySummary() {
  const res = await fetch('/data/industry_evaluations/_industry_summary.json');
  if (!res.ok) throw new Error('Failed to fetch industry summary');
  return res.json();
}

export async function fetchQualitativeAnalysis(symbol) {
  const symbolUpper = symbol.toUpperCase();
  const res = await fetch(`/data/qualitative_insights/${symbolUpper}/${symbolUpper}_individual.json`);
  if (!res.ok) throw new Error(`Failed to fetch qualitative analysis for ${symbolUpper}`);
  return res.json();
}
