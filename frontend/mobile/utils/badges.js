export const BADGES = [
  { id: 'first_steps',  label: 'First Steps',  stat: 'gamesPlayed',        threshold: 1   },
  { id: 'trail_blazer', label: 'Trail Blazer',  stat: 'checkpointsVisited', threshold: 5   },
  { id: 'nut_hoarder',  label: 'Nut Hoarder',   stat: 'totalPoints',        threshold: 100 },
  { id: 'party_animal', label: 'Party Animal',  stat: 'partiesJoined',      threshold: 1   },
];

export function computeBadges(stats) {
  if (!stats) return BADGES.map(b => ({ ...b, earned: false, earnedAt: null }));
  const earnedMap = Object.fromEntries((stats.badges ?? []).map(b => [b.badgeId, b.earnedAt]));
  return BADGES.map(b => ({
    ...b,
    earned: b.id in earnedMap,
    earnedAt: earnedMap[b.id] ?? null,
  }));
}
