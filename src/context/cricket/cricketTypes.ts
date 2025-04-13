
import { Team, Player, Match } from '@/types/cricket';

export interface CricketContextType {
  teams: Team[];
  players: Player[];
  matches: Match[];
  liveMatch: Match | null;
  activeTeams: Team[];
  completedMatches: Match[];
  
  // Team functions
  createTeam: (team: Omit<Team, 'id' | 'players'>) => Promise<Team>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  
  // Player functions
  addPlayer: (player: Omit<Player, 'id'>) => Promise<Player>;
  updatePlayer: (player: Player) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  
  // Match functions
  createMatch: (match: Omit<Match, 'id'>) => Promise<Match>;
  updateMatch: (match: Match) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  endMatch: (matchId: string, winnerId: string, mvpId: string) => Promise<void>;
  
  // Live match functions
  updateScore: (matchId: string, runs: number, wickets?: number) => Promise<void>;
  updateOvers: (matchId: string, overs: number) => Promise<void>;
  switchInnings: (matchId: string) => Promise<void>;
}
