import Link from 'next/link';
import { Trophy, LayoutDashboard, Vote } from 'lucide-react';
import { StatisticsService } from '@/services/statistics.service';
import { LeaderboardService } from '@/services/leaderboard.service';

export const revalidate = 0;

const statsService = new StatisticsService();
const leaderboardService = new LeaderboardService();

export default async function HomePage() {
  const [stats, leaderboardResult] = await Promise.all([
    statsService.getSystemStatistics(),
    leaderboardService.getLeaderboard({ period: 'all_time', limit: 5, page: 1 }),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-cyan-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            VotePlay E-sports
          </span>
        </div>

        <Link
          href="/admin"
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" /> Admin Console
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs px-3.5 py-1.5 rounded-full font-semibold">
          <Vote className="w-3.5 h-3.5" /> High-Performance Anti-Cheat Voting Platform
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Vote Your Favorite E-sports Players
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
          Built with Next.js 15 App Router, Supabase PostgreSQL, NevaCloud S3 Storage, Clean Architecture, and Anti-Spam Fingerprinting.
        </p>

        {/* Global Stats Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">{stats.totalVotes.toLocaleString()}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Total Votes</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">{stats.totalPlayers}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Pro Players</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">{stats.totalTeams}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Teams</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.totalGames}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Games</div>
          </div>
        </div>
      </section>

      {/* Live Ranking Preview */}
      <section className="max-w-4xl mx-auto px-6 pb-20 w-full">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Current Leaderboard Standings
            </h2>
            <Link href="/admin" className="text-xs text-cyan-400 font-semibold hover:underline">
              Open Admin Portal →
            </Link>
          </div>

          <div className="space-y-3">
            {leaderboardResult.items.map((item, idx) => (
              <div
                key={item.playerId || idx}
                className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : idx === 1
                        ? 'bg-slate-400/20 text-slate-200 border border-slate-400/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white text-base">{item.nickname}</div>
                    <div className="text-xs text-slate-400">
                      {item.teamName} • <span className="text-cyan-400">{item.gameName}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-extrabold text-sm px-3 py-1 rounded-lg">
                  {Number(item.totalVote).toLocaleString()} votes
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
