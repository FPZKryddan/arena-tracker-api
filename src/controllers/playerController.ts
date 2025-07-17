import { Request, Response, NextFunction } from 'express';
import { Regions } from '../types';
import {
  FetchChampionData,
  FetchPlayerMatchData,
  FetchPlayerMatchList,
  FetchSummonerData,
  FetchUserPuuid,
} from '../services/Hooks';
import { createEmptyPlayerStats } from '../services/createTemplate';
import {
  mapToRegionalRoutingValues,
  mapToPlatformRoutingValues,
} from '../services/assembly';
import { PlayerMatchIdentifty } from '../services/playerService';

export const getPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let matchList: string[] = [];
    let findingMatches = true;
    let idx = 0;
    const { gameName, tag, region } = req.query;

    const fetchChampionData = await FetchChampionData();
    const emptyPlayerTemplate = createEmptyPlayerStats(fetchChampionData);
    const regionalRouting = mapToRegionalRoutingValues(region as Regions);
    const platformRouting = mapToPlatformRoutingValues(region as Regions);
    const playerUuid = await FetchUserPuuid(
      String(gameName),
      String(tag),
      regionalRouting,
    );
    const FetchSummData = await FetchSummonerData(
      playerUuid.puuid,
      platformRouting,
    );

    emptyPlayerTemplate.gameName = gameName as string;
    emptyPlayerTemplate.tagLine = tag as string;
    emptyPlayerTemplate.puuid = playerUuid.puuid as string;

    while (findingMatches) {
      let matchListSegment: string[];
      try {
        matchListSegment = await FetchPlayerMatchList(
          playerUuid.puuid,
          idx * 100,
          100,
          1741088416,
          regionalRouting,
        );
      } catch (error) {
        console.error("Failed to fetch Player's match history:", error);
        return;
      }
      if (matchListSegment.length < 100) {
        findingMatches = false;
      }
      matchList = matchList.concat(matchListSegment);
      idx++;
    }
    const PlayerMatchData = await FetchPlayerMatchData(
      matchList,
      region as Regions,
    );
    if (!PlayerMatchData) {
      throw new Error('Player Match data null or Undefined');
    }
    const PlayerIdentify = await PlayerMatchIdentifty(
      playerUuid.puuid,
      PlayerMatchData,
      emptyPlayerTemplate,
    );
    try {
      emptyPlayerTemplate.profileIconId = FetchSummData.profileIconId;
      emptyPlayerTemplate.summonerLevel = FetchSummData.summonerLevel;
    } catch (error) {
      console.error('Failed to fetch summoner data for player:', error);
      return;
    }
    res.status(201).json(emptyPlayerTemplate);
  } catch (error) {
    next(error);
  }
};
