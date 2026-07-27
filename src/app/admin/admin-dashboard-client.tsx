'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Users,
  Shield,
  Gamepad2,
  Vote,
  Plus,
  Search,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Layers,
  UserCheck,
  Flame,
} from 'lucide-react';

export interface AdminGameItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  status: string;
}

export interface AdminTeamItem {
  id: string;
  gameId: string;
  name: string;
  slug: string;
  country?: string | null;
  logo?: string | null;
  game?: { name: string; slug: string } | null;
}

export interface AdminPlayerItem {
  id: string;
  gameId: string;
  teamId: string;
  nickname: string;
  fullName?: string | null;
  role?: string | null;
  country?: string | null;
  avatar?: string | null;
  status: string;
  totalVotes?: number;
  team?: { name: string; slug: string } | null;
  game?: { name: string; slug: string } | null;
}

export interface AdminLeaderboardEntry {
  playerId: string;
  nickname: string;
  teamName: string;
  gameName: string;
  totalVote: number | bigint;
}

export interface AdminStatsData {
  totalGames: number;
  totalTeams: number;
  totalPlayers: number;
  totalVotes: number;
  popularPlayer?: { nickname: string; votes: number } | null;
}

interface AdminDashboardClientProps {
  stats: AdminStatsData;
  games: AdminGameItem[];
  teams: AdminTeamItem[];
  players: AdminPlayerItem[];
  leaderboard: AdminLeaderboardEntry[];
}

export default function AdminDashboardClient({
  stats: initialStats,
  games: initialGames,
  teams: initialTeams,
  players: initialPlayers,
  leaderboard: initialLeaderboard,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'teams' | 'players' | 'leaderboard'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all_time');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  // Modal states
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  // Form inputs
  const [gameForm, setGameForm] = useState({ name: '', slug: '', description: '', logo: '', coverImage: '' });
  const [teamForm, setTeamForm] = useState({ gameId: initialGames[0]?.id || '', name: '', slug: '', country: 'Indonesia', logo: '' });
  const [playerForm, setPlayerForm] = useState({
    gameId: initialGames[0]?.id || '',
    teamId: initialTeams[0]?.id || '',
    nickname: '',
    fullName: '',
    role: 'Roamer',
    country: 'Indonesia',
    avatar: '',
  });

  const triggerToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create game');
      triggerToast(`Game "${gameForm.name}" created successfully!`);
      setShowAddGameModal(false);
      setGameForm({ name: '', slug: '', description: '', logo: '', coverImage: '' });
      window.location.reload();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create team');
      triggerToast(`Team "${teamForm.name}" created successfully!`);
      setShowAddTeamModal(false);
      setTeamForm({ gameId: initialGames[0]?.id || '', name: '', slug: '', country: 'Indonesia', logo: '' });
      window.location.reload();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create player');
      triggerToast(`Player "${playerForm.nickname}" created successfully!`);
      setShowAddPlayerModal(false);
      setPlayerForm({
        gameId: initialGames[0]?.id || '',
        teamId: initialTeams[0]?.id || '',
        nickname: '',
        fullName: '',
        role: 'Roamer',
        country: 'Indonesia',
        avatar: '',
      });
      window.location.reload();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const filteredPlayers = initialPlayers.filter((p) => {
    const matchesSearch =
      p.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.fullName && p.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.team?.name && p.team.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGame = selectedGameFilter === 'all' || p.gameId === selectedGameFilter;
    return matchesSearch && matchesGame;
  });

  const filteredTeams = initialTeams.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGameFilter === 'all' || t.gameId === selectedGameFilter;
    return matchesSearch && matchesGame;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{actionMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-cyan-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-cyan-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              VotePlay Admin Console
            </h1>
            <p className="text-xs text-slate-400 font-medium">Enterprise Backend & Realtime Database Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Supabase PostgreSQL Active
          </span>
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
            title="Refresh System Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'games', label: 'Games', icon: Gamepad2, count: initialGames.length },
            { id: 'teams', label: 'Teams', icon: Shield, count: initialTeams.length },
            { id: 'players', label: 'Players', icon: Users, count: initialPlayers.length },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'games' | 'teams' | 'players' | 'leaderboard')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-xs rounded-md ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Votes Cast</span>
                  <div className="bg-cyan-500/10 p-2 rounded-xl text-cyan-400">
                    <Vote className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {initialStats?.totalVotes?.toLocaleString() || '0'}
                </div>
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Realtime PostgreSQL Aggregations</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Players</span>
                  <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {initialStats?.totalPlayers || initialPlayers.length}
                </div>
                <div className="mt-2 text-xs text-slate-400 font-medium">Across {initialTeams.length} Pro E-sports Teams</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Teams</span>
                  <div className="bg-purple-500/10 p-2 rounded-xl text-purple-400">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">{initialTeams.length}</div>
                <div className="mt-2 text-xs text-slate-400 font-medium">Categorized in {initialGames.length} Games</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-xl">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Top Voted Player</span>
                  <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-amber-300 truncate">
                  {initialStats?.popularPlayer?.nickname || 'f0rsakeN'}
                </div>
                <div className="mt-2 text-xs text-amber-400 font-medium">
                  {initialStats?.popularPlayer?.votes?.toLocaleString() || '3,400'} Votes Recorded
                </div>
              </div>
            </div>

            {/* Quick Administrative Operations */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Quick Administrative Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowAddPlayerModal(true)}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg shadow-cyan-600/20"
                >
                  <Plus className="w-4 h-4" /> Add New Player
                </button>
                <button
                  onClick={() => setShowAddTeamModal(true)}
                  className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Add New Team
                </button>
                <button
                  onClick={() => setShowAddGameModal(true)}
                  className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Add New Game
                </button>
              </div>
            </div>

            {/* Live Roster Summary Overview */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Recent Player Roster
                </h2>
                <button
                  onClick={() => setActiveTab('players')}
                  className="text-xs text-cyan-400 hover:underline font-medium"
                >
                  View All ({initialPlayers.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialPlayers.slice(0, 6).map((player) => (
                  <div
                    key={player.id}
                    className="bg-slate-950/70 border border-slate-850 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-slate-300 font-bold text-sm">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.nickname} className="w-full h-full object-cover" />
                        ) : (
                          player.nickname.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white">{player.nickname}</div>
                        <div className="text-xs text-slate-400 font-medium">
                          {player.team?.name || 'Pro Team'} • <span className="text-cyan-400">{player.role || 'Player'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-xs px-2.5 py-1 rounded-lg">
                      {player.totalVotes ? player.totalVotes.toLocaleString() : 0} votes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Games */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">E-sports Games Management</h2>
                <p className="text-xs text-slate-400">List of games active for player voting</p>
              </div>
              <button
                onClick={() => setShowAddGameModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                <Plus className="w-4 h-4" /> Add Game
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialGames.map((game) => (
                <div key={game.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all">
                  <div className="h-32 bg-slate-800 relative">
                    {game.coverImage ? (
                      <img src={game.coverImage} alt={game.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center text-slate-600">
                        <Gamepad2 className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-md">
                      {game.status}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-base text-white">{game.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">slug: {game.slug}</p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">{game.description || 'No description provided.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Teams */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search team name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={() => setShowAddTeamModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                <Plus className="w-4 h-4" /> Add Team
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeams.map((team) => (
                <div key={team.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-slate-300">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      team.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base truncate">{team.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">slug: {team.slug}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">{team.country || 'Global'}</span>
                      <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-medium">{team.game?.name || 'E-sports'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Players (Full Data Table) */}
        {activeTab === 'players' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search player, role, team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <select
                  value={selectedGameFilter}
                  onChange={(e) => setSelectedGameFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Games</option>
                  {initialGames.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowAddPlayerModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-cyan-600/20 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" /> Add Player
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Player</th>
                      <th className="px-6 py-4">Team</th>
                      <th className="px-6 py-4">Game</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-right">Total Votes</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPlayers.map((player) => (
                      <tr key={player.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-300 flex-shrink-0">
                            {player.avatar ? (
                              <img src={player.avatar} alt={player.nickname} className="w-full h-full object-cover" />
                            ) : (
                              player.nickname.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-base">{player.nickname}</div>
                            <div className="text-xs text-slate-400">{player.fullName || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-200">{player.team?.name || 'Free Agent'}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium">
                            {player.game?.name || 'E-sports'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            {player.role || 'Player'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-white text-base">
                          {player.totalVotes ? player.totalVotes.toLocaleString() : 0}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                            {player.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Leaderboards */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Live Player Rankings
                </h2>
                <p className="text-xs text-slate-400">Realtime database leaderboard query</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                {['all_time', 'daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setPeriodFilter(period)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      periodFilter === period ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {period.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-center">Rank</th>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Team</th>
                    <th className="px-6 py-4">Game</th>
                    <th className="px-6 py-4 text-right">Votes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {initialLeaderboard.map((item, idx) => (
                    <tr key={item.playerId || idx} className="hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        {idx === 0 ? (
                          <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center justify-center font-extrabold text-sm">
                            🥇 1
                          </span>
                        ) : idx === 1 ? (
                          <span className="w-8 h-8 rounded-full bg-slate-400/20 text-slate-200 border border-slate-400/40 inline-flex items-center justify-center font-extrabold text-sm">
                            🥈 2
                          </span>
                        ) : idx === 2 ? (
                          <span className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 inline-flex items-center justify-center font-extrabold text-sm">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-bold text-slate-400 text-sm">#{idx + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-white text-base">{item.nickname}</td>
                      <td className="px-6 py-4 text-slate-300">{item.teamName}</td>
                      <td className="px-6 py-4 text-cyan-400 text-xs font-semibold">{item.gameName}</td>
                      <td className="px-6 py-4 text-right font-extrabold text-white text-lg">
                        {item.totalVote ? Number(item.totalVote).toLocaleString() : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Game */}
      {showAddGameModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Game</h3>
            <form onSubmit={handleCreateGame} className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Game Name</label>
                <input
                  type="text"
                  required
                  value={gameForm.name}
                  onChange={(e) =>
                    setGameForm({ ...gameForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={gameForm.slug}
                  onChange={(e) => setGameForm({ ...gameForm, slug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea
                  value={gameForm.description}
                  onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGameModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">
                  Save Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Team */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Select Game</label>
                <select
                  value={teamForm.gameId}
                  onChange={(e) => setTeamForm({ ...teamForm, gameId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {initialGames.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Country</label>
                <input
                  type="text"
                  value={teamForm.country}
                  onChange={(e) => setTeamForm({ ...teamForm, country: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Player */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Player</h3>
            <form onSubmit={handleCreatePlayer} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Game</label>
                  <select
                    value={playerForm.gameId}
                    onChange={(e) => setPlayerForm({ ...playerForm, gameId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {initialGames.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Team</label>
                  <select
                    value={playerForm.teamId}
                    onChange={(e) => setPlayerForm({ ...playerForm, teamId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {initialTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nickname</label>
                <input
                  type="text"
                  required
                  value={playerForm.nickname}
                  onChange={(e) => setPlayerForm({ ...playerForm, nickname: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={playerForm.fullName}
                  onChange={(e) => setPlayerForm({ ...playerForm, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Role</label>
                  <input
                    type="text"
                    value={playerForm.role}
                    onChange={(e) => setPlayerForm({ ...playerForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Country</label>
                  <input
                    type="text"
                    value={playerForm.country}
                    onChange={(e) => setPlayerForm({ ...playerForm, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">
                  Save Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
