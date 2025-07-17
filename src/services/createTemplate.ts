import {
  championData,
  championStatsDto,
  damageStatsDto,
  damageTakenStatsDto,
  goldStatsDto,
  infographicsDto,
  killDeathAssistsDto,
  numericalStatsDto,
  PlayerStats,
  skillShotsDto,
} from '../types';
import { PopulatePlacements } from './assembly';

export const createEmptyInfographics = (): infographicsDto => {
  const createEmptyNumericalStats = (): numericalStatsDto => ({
    value: 0,
    records: [],
  });

  const createEmptyDamageStats = (): damageStatsDto => ({
    total: {
      total: createEmptyNumericalStats(),
      champions: createEmptyNumericalStats(),
    },
    true: {
      total: createEmptyNumericalStats(),
      champions: createEmptyNumericalStats(),
    },
    magic: {
      total: createEmptyNumericalStats(),
      champions: createEmptyNumericalStats(),
    },
    physical: {
      total: createEmptyNumericalStats(),
      champions: createEmptyNumericalStats(),
    },
    perMinute: createEmptyNumericalStats(),
  });

  const createEmptyDamageTakenStats = (): damageTakenStatsDto => ({
    total: createEmptyNumericalStats(),
    true: createEmptyNumericalStats(),
    magic: createEmptyNumericalStats(),
    physical: createEmptyNumericalStats(),
    mitigated: createEmptyNumericalStats(),
  });

  const createEmptyGoldStats = (): goldStatsDto => ({
    earned: createEmptyNumericalStats(),
    spent: createEmptyNumericalStats(),
    perMinute: createEmptyNumericalStats(),
  });

  const createEmptySkillShotStats = (): skillShotsDto => ({
    dodged: createEmptyNumericalStats(),
    hit: createEmptyNumericalStats(),
  });

  const createEmptyKillsDeathsAssists = (): killDeathAssistsDto => ({
    kda: createEmptyNumericalStats(),
    kills: createEmptyNumericalStats(),
    deaths: createEmptyNumericalStats(),
    assists: createEmptyNumericalStats(),
  });

  return {
    damageStats: createEmptyDamageStats(),
    damageTakenStats: createEmptyDamageTakenStats(),
    goldStats: createEmptyGoldStats(),
    skillShotsStats: createEmptySkillShotStats(),
    killsDeathsAssists: createEmptyKillsDeathsAssists(),
  };
};

export const createEmptyPlayerStats = (
  championData: championData[],
): PlayerStats => {
  return {
    gameName: '',
    tagLine: '',
    puuid: '',
    profileIconId: 0,
    summonerLevel: 0,
    matchesPlayed: 0,
    latestGamePlayed: 0,
    placements: PopulatePlacements(0),
    placementAvg: 0,
    infographics: createEmptyInfographics(),
    augmentStats: {},
    championStats: createEmptyChampionStats(championData),
  };
};

export const createEmptyChampionStats = (
  championData: championData[],
): {
  [championName: string]: championStatsDto;
} => {
  const emptyChampionStats: { [championName: string]: championStatsDto } = {};
  championData.forEach((champion) => {
    emptyChampionStats[champion.id] = {
      timesPlayed: 0,
      placements: PopulatePlacements(0),
      placementAvg: 0,
      infographics: createEmptyInfographics(),
      augmentStats: {},
      name: champion.displayName,
      id: champion.id,
      stage: 0,
    };
  });
  return emptyChampionStats;
};
