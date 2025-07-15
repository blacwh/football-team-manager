// Core types for the football team app

export interface Team {
  id: string;
  name: string;
  points: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDifference: number;
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  isCompleted: boolean;
  round: number;
  gameDate?: string;
}

export interface GameSession {
  id: string;
  date: string;
  teams: Team[];
  games: Game[];
  isCompleted: boolean;
  sessionName?: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  teamId?: string;
  profileImage?: string;
  stats?: PlayerStats;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  gamesPlayed: number;
}

export interface ScheduleGeneratorInput {
  teamNames: string[];
  numTeams: number;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
  isActive?: boolean;
}