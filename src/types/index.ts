import { EntityStatus, AdminRole, VoteSource, AuditAction } from '@prisma/client';

export { EntityStatus, AdminRole, VoteSource, AuditAction };

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  timestamp: string;
}

export interface LeaderboardItem {
  playerId: string;
  nickname: string;
  fullName: string | null;
  avatar: string | null;
  playerRole: string | null;
  playerCountry: string | null;
  teamId: string;
  teamName: string;
  teamSlug: string;
  teamLogo: string | null;
  gameId: string;
  gameName: string;
  gameSlug: string;
  totalVote: number;
  dailyVote: number;
  weeklyVote: number;
  monthlyVote: number;
  yearlyVote: number;
  lastVotedAt: Date;
  rank?: number;
}

export interface SystemStatistics {
  totalGames: number;
  totalTeams: number;
  totalPlayers: number;
  totalVotes: number;
  todayVotes: number;
  thisWeekVotes: number;
  thisMonthVotes: number;
  popularPlayer: {
    id: string;
    nickname: string;
    votes: number;
  } | null;
  popularGame: {
    id: string;
    name: string;
    votes: number;
  } | null;
  popularTeam: {
    id: string;
    name: string;
    votes: number;
  } | null;
}
