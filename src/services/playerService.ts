import {
  MatchDto,
  numericalStatsDto,
  ParticipantDto,
  placementDto,
  PlayerStats,
  recordsDto,
} from '../types';
import { PopulatePlayerStatsFromMatch } from './assembly';

export const GetParticipantIdByPuuid = (
  matchData: MatchDto,
  player: string,
): number | null => {
  const participants: ParticipantDto[] = matchData.info.participants;

  let foundId: number | null = null;
  participants.forEach((participant) => {
    if (participant.puuid === player) {
      foundId = participant.participantId - 1;
      return;
    }
  });

  return foundId;
};

export const PlayerMatchIdentifty = async (
  puuid: string,
  matches: MatchDto[],
  tempPlayerStats: PlayerStats,
) => {
  const playerParticipantIdToMatch: { playerId: number; match: MatchDto }[] =
    matches
      .map((match) => {
        const id = GetParticipantIdByPuuid(match, puuid);
        return id !== null ? { playerId: id, match } : null;
      })
      .filter(
        (item): item is { playerId: number; match: MatchDto } => item !== null,
      );
  // Populate player stats from all retrieved matches
  for (const matchMapping of playerParticipantIdToMatch) {
    try {
      tempPlayerStats = PopulatePlayerStatsFromMatch(
        tempPlayerStats,
        matchMapping.match,
        matchMapping.playerId,
      );
    } catch (error) {
      console.error('Failed to fetch populate player stats from match:', error);
    }
  }
  return tempPlayerStats;
};

export const updateRecords = (
  records: recordsDto,
  value: number,
  matchId: string,
): recordsDto => {
  const newRecords = [...records, { value, matchId }];
  newRecords.sort((a, b) => b.value - a.value);
  return newRecords.splice(0, 5);
};

export const updateNumericalStat = (
  stat: numericalStatsDto,
  value: number,
  matchId: string,
): numericalStatsDto => ({
  value: (stat.value += value),
  records: updateRecords(stat.records, value, matchId),
});

export const PlacementToStage = (placement: number): number => {
  if (placement === 1) return 3;
  else if (placement <= 4) return 2;
  return 1;
};

export const CalculatePlacementAvg = (
  placements: placementDto,
  timesPlayed: number,
): number => {
  let totalPlacements = 0;

  for (let i = 1; i <= 8; i++) {
    const count = placements[i as keyof placementDto] || 0;
    totalPlacements += i * count;
  }

  return totalPlacements / timesPlayed;
};
