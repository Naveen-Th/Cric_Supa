
export interface Team {
  id: string;
  name: string;
  logo?: string;
  status: 'active' | 'inactive';
  players?: Player[]; // Adding players array to Team interface
  created_at?: string;
  updated_at?: string;
}

export interface Player {
  id: string;
  name: string;
  role: string;
  team_id: string;
  teamId?: string; // Adding alias property for compatibility
  battingStats?: BattingStats;
  bowlingStats?: BowlingStats;
  created_at?: string;
  updated_at?: string;
}

export type MatchStatus = 'upcoming' | 'live' | 'completed';

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  date: string;
  venue: string;
  status: MatchStatus;
  currentInnings?: number;
  tossWinnerId?: string;
  tossChoice?: string;
  winnerId?: string;
  mvpId?: string;
  totalOvers: number;
  innings1?: Innings;
  innings2?: Innings;
  created_at?: string;
  updated_at?: string;
}

export interface BattingStats {
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  notOut?: boolean;
  dismissalInfo?: string;
}

export interface BowlingStats {
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economyRate?: number;
}

export interface Innings {
  teamId: string;
  runs: number;
  wickets: number;
  overs: number;
  extras: number;
  battingOrder?: string[];
  fallOfWickets?: FallOfWicket[];
  bowlerId?: string; // Adding this property as it's used in some parts of the code
}

export interface FallOfWicket {
  runs: number;
  wicketNumber: number;
  overs: number;
  playerName: string;
}

export interface BattingPartnership {
  id: string;
  match_id: string;
  striker_id: string;
  non_striker_id: string | null;
  innings_number: number;
  created_at?: string;
  updated_at?: string;
}

export interface MatchBattingStats {
  id: string;
  match_id: string;
  team_id: string | null;
  innings_number: number;
  player_id: string;
  player_name: string;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  status: 'not_out' | 'out' | 'yet_to_bat';
  dismissal_type?: string;
  dismissal_info?: string;
  is_striker: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MatchBowlingStats {
  id: string;
  match_id: string;
  team_id: string | null;
  innings_number: number;
  player_id: string;
  player_name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  no_balls: number;
  wides: number;
  created_at?: string;
  updated_at?: string;
}

export interface MatchProgress {
  id: string;
  match_id: string;
  innings_number: number;
  over_number: number;
  balls_in_over: number;
  runs_scored: number;
  wickets_lost: number;
  over_summary?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  team_id: string | null;
  player_id: string;
  player_name: string;
  batting_order?: number;
  role?: string;
  is_captain: boolean;
  is_keeper: boolean;
  has_batted: boolean;
  is_playing: boolean;
  created_at?: string;
  updated_at?: string;
}

// Remove the duplicate MatchStatus interface and use the type defined above
export interface MatchStatusObject {
  id: string;
  match_id: string;
  current_innings: number;
  batting_team_id: string;
  bowling_team_id: string;
  striker_id?: string;
  non_striker_id?: string;
  current_bowler_id?: string;
  current_over: number;
  ball_in_over: number;
  partnership_runs: number;
  partnership_balls: number;
  last_updated: string;
}
