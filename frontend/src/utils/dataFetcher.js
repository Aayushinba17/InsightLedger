const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchIndustrySummary() {
  const res = await fetch(`${API_BASE_URL}/api/industry-summary`);
  if (!res.ok) throw new Error('Failed to fetch industry summary');
  return res.json();
}

export async function fetchQualitativeAnalysis(symbol) {
  const symbolUpper = symbol.toUpperCase();
  const res = await fetch(`${API_BASE_URL}/api/company/${symbolUpper}`);
  if (!res.ok) throw new Error(`Failed to fetch qualitative analysis for ${symbolUpper}`);
  return res.json();
}

export async function fetchAllSectors() {
  const res = await fetch(`${API_BASE_URL}/api/sectors`);
  if (!res.ok) throw new Error('Failed to fetch sectors');
  return res.json();
}