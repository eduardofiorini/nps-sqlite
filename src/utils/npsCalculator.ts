import { NpsResponse } from '../types';

// NPS calculation
export const calculateNPS = (responses: NpsResponse[]): number => {
  if (!responses.length) return 0;
  
  const promoters = responses.filter(r => r.score >= 9).length;
  const detractors = responses.filter(r => r.score <= 6).length;
  
  return Math.round(((promoters - detractors) / responses.length) * 100);
};

// Response categorization
export const categorizeResponses = (responses: NpsResponse[]) => {
  const promoters = responses.filter(r => r.score >= 9).length;
  const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
  const detractors = responses.filter(r => r.score <= 6).length;
  
  return { promoters, passives, detractors, total: responses.length };
};

// Group responses by source
export const responsesBySource = (responses: NpsResponse[]) => {
  const bySource: Record<string, NpsResponse[]> = {};
  
  responses.forEach(response => {
    if (!bySource[response.sourceId]) {
      bySource[response.sourceId] = [];
    }
    bySource[response.sourceId].push(response);
  });
  
  return bySource;
};

// Group responses by score
export const responsesByScore = (responses: NpsResponse[]) => {
  const byScore: Record<number, number> = {};
  
  // Initialize all scores from 0 to 10
  for (let i = 0; i <= 10; i++) {
    byScore[i] = 0;
  }
  
  // Count responses by score
  responses.forEach(response => {
    byScore[response.score]++;
  });
  
  return byScore;
};

// Calculate NPS over time (by weeks)
export const npsOverTime = (responses: NpsResponse[], weeks = 8) => {
  // Sort responses by date
  const sortedResponses = [...responses].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  if (!sortedResponses.length) return [];
  
  // Find the start and end dates
  const firstDate = new Date(sortedResponses[0].createdAt);
  const lastDate = new Date();
  
  // Calculate the time range to divide into weeks
  const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPerPeriod = Math.max(Math.floor(totalDays / weeks), 7);
  
  const periods: { date: string; nps: number }[] = [];
  
  // For each period
  for (let i = 0; i < weeks; i++) {
    const periodStart = new Date(firstDate);
    periodStart.setDate(periodStart.getDate() + i * daysPerPeriod);
    
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + daysPerPeriod);
    
    const periodResponses = sortedResponses.filter(response => {
      const date = new Date(response.createdAt);
      return date >= periodStart && date < periodEnd;
    });
    
    const periodNPS = calculateNPS(periodResponses);
    
    periods.push({
      date: periodStart.toLocaleDateString(),
      nps: periodNPS
    });
  }
  
  return periods;
};