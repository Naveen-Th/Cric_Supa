
import { Team, Player, Match } from '@/types/cricket';

export interface CricketContextType {
  teams: Team[];
  players: Player[];
  matches: Match[];
  liveMatch: Match | null;
  activeTeams: Team[];
  completedMatches: Match[];
  loading?: boolean;
  
  createTeam: (team: Omit<Team, 'id'>) => Promise<Team>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  
  addPlayer: (player: Omit<Player, 'id'>) => Promise<Player>;
  updatePlayer: (player: Player) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  
  createMatch: (match: Omit<Match, 'id'>) => Promise<Match>;
  updateMatch: (match: Match) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  endMatch: (matchId: string, winnerId: string, mvpId: string) => Promise<void>;
  
  updateScore: (matchId: string, runs: number, wickets?: number) => Promise<void>;
  updateOvers: (matchId: string, overs: number) => Promise<void>;
  switchInnings: (matchId: string) => Promise<void>;
}

// Add interface for batting partnership
export interface BattingPartnership {
  id: string;
  match_id: string;
  striker_id: string;
  non_striker_id: string | null;
  innings_number: number;
  created_at?: string;
  updated_at?: string;
}
