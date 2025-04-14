
export type Player = {
  id: string;
  name: string;
  role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper';
  battingStats?: {
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
  };
  bowlingStats?: {
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
  };
  teamId: string;
};

export type Team = {
  id: string;
  name: string;
  logo?: string;
  players: Player[];
  status: 'active' | 'inactive';
};

export type Innings = {
  teamId: string;
  runs: number;
  wickets: number;
  overs: number;
  battingOrder: string[];
  extras: number;
};

export type MatchStatus = 'upcoming' | 'live' | 'completed';

export type Match = {
  id: string;
  team1Id: string;
  team2Id: string;
  date: string;
  venue: string;
  status: MatchStatus;
  tossWinnerId?: string;
  tossChoice?: 'bat' | 'bowl';
  currentInnings: 1 | 2;
  totalOvers: number;
  innings1?: Innings;
  innings2?: Innings;
  winnerId?: string;
  mvpId?: string;
  // Additional properties for displaying data from direct Supabase query
  team1?: { name: string };
  team2?: { name: string };
  winner?: { name: string };
  mvp?: { name: string };
};
