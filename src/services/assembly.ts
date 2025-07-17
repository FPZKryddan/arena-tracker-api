import { augmentsStatsDto, infographicsDto, MatchDto, ParticipantDto, placementDto, PlayerStats, Regions } from "../types";
import { createEmptyInfographics } from "./createTemplate";
import { CalculatePlacementAvg, updateNumericalStat } from "./playerService";

export const mapToPlatformRoutingValues = (selectedRegion: Regions): string => {
    switch (selectedRegion) {
      case "EUNE":
        return "eun1";
      case "NA":
        return "na1";
      case "EUW":
      default:
        return "euw1";
    }
  };

  export const mapToRegionalRoutingValues = (selectedRegion: Regions): string => {
    switch (selectedRegion) {
      case "NA":
        return "AMERICAS";
      case "EUNE":
      case "EUW":
      default:
        return "EUROPE";
    }
  };

export const PopulatePlayerStatsFromMatch = (
    playerStats: PlayerStats,
    match: MatchDto,
    playerId: number
  ): PlayerStats => {
    const player = match.info.participants[playerId];
    if (!player)
      throw new Error(
        `Player not found in match with id: ${playerId} of match: ${match.metadata.matchId}`
      );

    let champion = player.championName;
    if (champion === 'FiddleSticks') champion = 'Fiddlesticks';
    if (!(champion in playerStats.championStats)) {
      playerStats.championStats[champion] = {
        timesPlayed: 0,
        placements: PopulatePlacements(0),
        placementAvg: 0,
        infographics: createEmptyInfographics(),
        augmentStats: {},
        name: champion,
        id: champion,
        stage: 0,
      };
    }

    playerStats.latestGamePlayed = Math.max(
      playerStats.latestGamePlayed,
      match.info.gameEndTimestamp
    );
    playerStats.matchesPlayed += 1;
    playerStats.placements[player.placement] += 1;
    playerStats.placementAvg = CalculatePlacementAvg(
      playerStats.placements,
      playerStats.matchesPlayed
    );
    playerStats.infographics = populateInfographicsStats(
      player,
      playerStats.infographics,
      match.metadata.matchId
    );
    playerStats.augmentStats = populateAugmentStats(
      player,
      playerStats.augmentStats
    );

    const championStats = playerStats.championStats[champion];
    championStats.timesPlayed += 1;
    championStats.placements[player.placement] += 1;
    championStats.placementAvg = CalculatePlacementAvg(
      championStats.placements,
      championStats.timesPlayed
    );
    championStats.infographics = populateInfographicsStats(
      player,
      championStats.infographics,
      match.metadata.matchId
    );
    championStats.augmentStats = populateAugmentStats(
      player,
      championStats.augmentStats
    );
    const championStageInMatch = PlacementToStage(player.placement);
    championStats.stage = Math.max(championStats.stage, championStageInMatch);

    return playerStats;
  };

export const populateAugmentStats = (
    playerMatchStats: ParticipantDto,
    augmentStats: augmentsStatsDto,
  ): augmentsStatsDto => {
    const updatedStats = { ...augmentStats };

    const augmentKeys = [
      playerMatchStats.playerAugment1,
      playerMatchStats.playerAugment2,
      playerMatchStats.playerAugment3,
      playerMatchStats.playerAugment4,
    ];

    augmentKeys.forEach((augment) => {
      if (!updatedStats[augment]) {
        updatedStats[augment] = { picked: 1 };
      } else {
        updatedStats[augment].picked += 1;
      }
    });

    return updatedStats;
  };

 export const populateInfographicsStats = (
    playerMatchStats: ParticipantDto,
    infographics: infographicsDto,
    matchId: string
  ): infographicsDto => {
    return {
      ...infographics,
      skillShotsStats: {
        hit: updateNumericalStat(
          infographics.skillShotsStats.hit,
          playerMatchStats.challenges.skillshotsHit,
          matchId
        ),
        dodged: updateNumericalStat(
          infographics.skillShotsStats.dodged,
          playerMatchStats.challenges.skillshotsDodged,
          matchId
        ),
      },

      goldStats: {
        earned: updateNumericalStat(
          infographics.goldStats.earned,
          playerMatchStats.goldEarned,
          matchId
        ),
        spent: updateNumericalStat(
          infographics.goldStats.spent,
          playerMatchStats.goldSpent,
          matchId
        ),
        perMinute: updateNumericalStat(
          infographics.goldStats.perMinute,
          playerMatchStats.challenges.goldPerMinute,
          matchId
        )
      },

      damageStats: {
        total: {
          total: updateNumericalStat(
            infographics.damageStats.total.total,
            playerMatchStats.totalDamageDealt,
            matchId
          ),
          champions: updateNumericalStat(
            infographics.damageStats.total.champions,
            playerMatchStats.totalDamageDealtToChampions,
            matchId
          ),
        },
        true: {
          total: updateNumericalStat(
            infographics.damageStats.true.total,
            playerMatchStats.trueDamageDealt,
            matchId
          ),
          champions: updateNumericalStat(
            infographics.damageStats.true.champions,
            playerMatchStats.trueDamageDealtToChampions,
            matchId
          )
        },
        magic: {
          total: updateNumericalStat(
            infographics.damageStats.magic.total,
            playerMatchStats.magicDamageDealt,
            matchId
          ),
          champions: updateNumericalStat(
            infographics.damageStats.magic.champions,
            playerMatchStats.magicDamageDealtToChampions,
            matchId
          )
        },
        physical: {
          total: updateNumericalStat(
            infographics.damageStats.physical.total,
            playerMatchStats.physicalDamageDealt,
            matchId
          ),
          champions: updateNumericalStat(
            infographics.damageStats.physical.champions,
            playerMatchStats.physicalDamageDealtToChampions,
            matchId
          )
        },
        perMinute: updateNumericalStat(
          infographics.damageStats.perMinute,
          playerMatchStats.challenges.damagePerMinute,
          matchId
        ),
      },

      damageTakenStats: {
        total: updateNumericalStat(
          infographics.damageTakenStats.total,
          playerMatchStats.totalDamageTaken,
          matchId
        ),
        true: updateNumericalStat(
          infographics.damageTakenStats.true,
          playerMatchStats.trueDamageTaken,
          matchId
        ),
        magic: updateNumericalStat(
          infographics.damageTakenStats.magic,
          playerMatchStats.magicDamageTaken,
          matchId
        ),
        physical: updateNumericalStat(
          infographics.damageTakenStats.physical,
          playerMatchStats.physicalDamageTaken,
          matchId
        ),
        mitigated: updateNumericalStat(
          infographics.damageTakenStats.mitigated,
          playerMatchStats.damageSelfMitigated,
          matchId
        )
      },

      killsDeathsAssists: {
        kda: updateNumericalStat(
          infographics.killsDeathsAssists.kda,
          playerMatchStats.challenges.kda,
          matchId
        ),
        kills: updateNumericalStat(
          infographics.killsDeathsAssists.kills,
          playerMatchStats.kills,
          matchId,
        ),
        deaths: updateNumericalStat(
          infographics.killsDeathsAssists.deaths,
          playerMatchStats.deaths,
          matchId
        ),
        assists: updateNumericalStat(
          infographics.killsDeathsAssists.assists,
          playerMatchStats.assists,
          matchId
        )
      }
    };
  };

export const PlacementToStage = (placement: number): number => {
      if (placement === 1) return 3;
      else if (placement <= 4) return 2;
      return 1;
    };
  
export const PopulatePlacements = (placement: number): placementDto => {
      const newPlacementsDto: placementDto = {};
      for (let i = 1; i <= 8; i++) {
        newPlacementsDto[i] = i === placement ? 1 : 0;
      }
      return newPlacementsDto;
    };