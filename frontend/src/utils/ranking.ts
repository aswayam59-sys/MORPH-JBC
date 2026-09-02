import { Team } from '../types';

/**
 * Calculates rankings based on Total Morph Value (Available Cash + Current Market Investments) in descending order.
 * Teams with identical coin/portfolio balances receive the same rank.
 * The subsequent rank reflects standard competition ranking (e.g., 1, 1, 3).
 */
export function calculateRankings(teams: Team[]): Team[] {
  const getTeamEffectiveValue = (t: Team): number => {
    const invested = typeof t.marketInvestedValue === 'number' ? t.marketInvestedValue : 0;
    return t.morphCoins + invested;
  };

  // Sort descending by totalMorphValue, tiebreaker by id/teamNumber
  const sorted = [...teams].sort((a, b) => {
    const valA = getTeamEffectiveValue(a);
    const valB = getTeamEffectiveValue(b);
    if (valB !== valA) {
      return valB - valA;
    }
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  let currentRank = 1;
  const rankedTeams: Team[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const currentVal = getTeamEffectiveValue(sorted[i]);
    const prevVal = i > 0 ? getTeamEffectiveValue(sorted[i - 1]) : currentVal;

    if (i > 0 && currentVal < prevVal) {
      currentRank = i + 1;
    }
    rankedTeams.push({
      ...sorted[i],
      marketInvestedValue: sorted[i].marketInvestedValue || 0,
      totalMorphValue: currentVal,
      rank: currentRank,
    });
  }

  return rankedTeams;
}

