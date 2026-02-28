import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {
  Trophy, Medal, Crown, TrendingUp, ArrowUp, ArrowDown,
  Home, Users, Target, Clock, ChevronRight, ChevronLeft,
  Info, Sparkles, Flame, Award
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SubjectLeaderboardPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all_time');
  const [showRankingInfo, setShowRankingInfo] = useState(false);

  useEffect(() => {
    if (subject) {
      fetchLeaderboard();
    }
  }, [subject, timeFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API}/leaderboard/${encodeURIComponent(subject)}/full?time_filter=${timeFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setLeaderboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPodiumStyle = (rank) => {
    if (rank === 1) return {
      bg: 'bg-gradient-to-br from-amber-400 to-amber-500',
      border: 'ring-4 ring-amber-300',
      size: 'h-32',
      icon: '🥇',
      label: '1st'
    };
    if (rank === 2) return {
      bg: 'bg-gradient-to-br from-gray-300 to-gray-400',
      border: 'ring-4 ring-gray-200',
      size: 'h-24',
      icon: '🥈',
      label: '2nd'
    };
    if (rank === 3) return {
      bg: 'bg-gradient-to-br from-orange-400 to-orange-500',
      border: 'ring-4 ring-orange-300',
      size: 'h-20',
      icon: '🥉',
      label: '3rd'
    };
    return { bg: 'bg-gray-100', border: '', size: 'h-16', icon: '', label: '' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center">
              <img src="/logo-full.png" alt="Crack CUET" className="h-8 md:h-10" />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-brand">Dashboard</Link>
              <Link to="/leaderboard" className="text-sm font-medium text-gray-600 hover:text-brand">Leaderboard</Link>
              <span className="text-sm font-medium text-cta">{subject}</span>
            </nav>

            <div className="flex items-center space-x-3">
              <Button onClick={() => navigate('/leaderboard')} variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                All Subjects
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm">
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Trophy className="h-8 w-8 text-amber-500 mr-3" />
              {subject} Leaderboard
            </h1>
            <p className="text-gray-600 mt-1">
              {leaderboardData?.total_participants?.toLocaleString() || 0} aspirants competing
            </p>
          </div>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[160px]" data-testid="time-filter">
              <SelectValue placeholder="Time Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">All Time</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-cta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : leaderboardData ? (
          <div className="space-y-8">
            {/* SECTION A: Personal Performance Card */}
            <Card className="border-0 shadow-lg overflow-hidden" data-testid="personal-stats-card">
              {leaderboardData.personal_stats?.has_attempted ? (
                <>
                  <div className="bg-gradient-to-r from-brand to-brand/80 p-6 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-3xl font-bold text-amber-300">
                            #{leaderboardData.personal_stats.rank}
                          </span>
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">Your National Rank</p>
                          <p className="text-2xl font-bold">
                            out of {leaderboardData.total_participants?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-center">
                        <div>
                          <p className="text-white/70 text-sm">Percentile</p>
                          <p className="text-2xl font-bold text-green-300">
                            {leaderboardData.personal_stats.percentile?.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">Best Score</p>
                          <p className="text-2xl font-bold">
                            {leaderboardData.personal_stats.best_score}/250
                          </p>
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">Best Time</p>
                          <p className="text-2xl font-bold">
                            {formatTime(leaderboardData.personal_stats.best_time_seconds)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Motivational Message */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-t border-amber-100">
                    <p className="text-center text-amber-800 font-medium flex items-center justify-center">
                      <Flame className="h-5 w-5 mr-2 text-orange-500" />
                      {leaderboardData.personal_stats.motivational_message}
                    </p>
                  </div>
                </>
              ) : (
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    You haven't attempted this subject yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Take a {subject} mock test to see your rank and compete with {leaderboardData.total_participants?.toLocaleString() || 0} aspirants!
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="bg-cta hover:bg-cta-hover text-white"
                    data-testid="take-mock-cta"
                  >
                    Take {subject} Mock
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* SECTION B: Ranking Logic Info */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowRankingInfo(!showRankingInfo)}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                data-testid="ranking-info-toggle"
              >
                <Info className="h-4 w-4 mr-2" />
                {showRankingInfo ? 'Hide' : 'Show'} how ranking works
              </button>
            </div>

            {showRankingInfo && leaderboardData.ranking_explanation && (
              <Card className="border border-blue-100 bg-blue-50/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {leaderboardData.ranking_explanation.title}
                  </h4>
                  <p className="text-sm text-blue-800">
                    {leaderboardData.ranking_explanation.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* SECTION C: Top 3 Podium */}
            {leaderboardData.top_three && leaderboardData.top_three.length > 0 && (
              <Card className="border-0 shadow-lg overflow-hidden" data-testid="top-three-podium">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-400 text-white">
                  <CardTitle className="flex items-center">
                    <Crown className="h-6 w-6 mr-2" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex items-end justify-center gap-4 mb-6">
                    {/* Arrange as 2nd, 1st, 3rd */}
                    {[
                      leaderboardData.top_three[1],
                      leaderboardData.top_three[0],
                      leaderboardData.top_three[2]
                    ].filter(Boolean).map((entry, idx) => {
                      const style = getPodiumStyle(entry.rank);
                      const actualIdx = entry.rank === 1 ? 1 : entry.rank === 2 ? 0 : 2;
                      
                      return (
                        <div key={entry.rank} className="flex flex-col items-center">
                          <div className={`${style.bg} ${style.border} ${style.size} w-20 sm:w-28 rounded-t-xl flex flex-col items-center justify-end pb-2 text-white shadow-lg`}>
                            <span className="text-2xl mb-1">{style.icon}</span>
                            <span className="font-bold text-lg">{style.label}</span>
                          </div>
                          <div className={`bg-white shadow-md rounded-b-xl p-3 w-20 sm:w-28 text-center border-t-0 ${
                            entry.is_current_user ? 'ring-2 ring-cta' : ''
                          }`}>
                            <p className={`font-semibold text-xs sm:text-sm truncate ${
                              entry.is_current_user ? 'text-cta' : 'text-gray-900'
                            }`}>
                              {entry.user_name}
                              {entry.is_current_user && <span className="text-cta"> (You)</span>}
                            </p>
                            <p className="text-lg font-bold text-gray-900">{entry.score}</p>
                            <p className="text-xs text-gray-500">{formatTime(entry.time_taken_seconds)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECTION D: Nearby Competitors */}
            {leaderboardData.nearby_competitors && leaderboardData.nearby_competitors.length > 0 && (
              <Card className="border-0 shadow-lg" data-testid="nearby-competitors">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 text-cta mr-2" />
                    Your Competition Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboardData.nearby_competitors.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                          entry.is_current_user
                            ? 'bg-gradient-to-r from-cta/10 to-cta/5 border-2 border-cta shadow-md'
                            : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <span className={`text-lg font-bold w-12 ${
                            entry.is_current_user ? 'text-cta' : 'text-gray-500'
                          }`}>
                            #{entry.rank}
                          </span>
                          <div>
                            <p className={`font-semibold ${
                              entry.is_current_user ? 'text-cta' : 'text-gray-900'
                            }`}>
                              {entry.is_current_user ? '👉 YOU' : entry.user_name}
                            </p>
                            {entry.is_current_user && (
                              <p className="text-xs text-gray-500">{entry.user_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{entry.score}/250</p>
                            <p className="text-xs text-green-600">{entry.percentile?.toFixed(1)}%ile</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {formatTime(entry.time_taken_seconds)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECTION E: Full Leaderboard Table */}
            <Card className="border-0 shadow-lg" data-testid="full-leaderboard">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Award className="h-5 w-5 text-amber-500 mr-2" />
                    Full Leaderboard
                  </span>
                  <Badge variant="outline" className="text-gray-500">
                    Top 100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardData.full_leaderboard && leaderboardData.full_leaderboard.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Rank</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">Score</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">Percentile</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardData.full_leaderboard.map((entry) => (
                          <tr
                            key={entry.rank}
                            className={`border-b border-gray-100 transition-colors ${
                              entry.is_current_user
                                ? 'bg-cta/5 hover:bg-cta/10'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <span className={`font-bold ${
                                entry.rank <= 3 ? 'text-amber-600' : 
                                entry.is_current_user ? 'text-cta' : 'text-gray-500'
                              }`}>
                                {entry.rank <= 3 ? (
                                  <span className="text-lg">
                                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                                  </span>
                                ) : `#${entry.rank}`}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${
                                entry.is_current_user ? 'text-cta' : 'text-gray-900'
                              }`}>
                                {entry.user_name}
                                {entry.is_current_user && (
                                  <Badge className="ml-2 bg-cta text-white text-xs">You</Badge>
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-semibold text-gray-900">{entry.score}/250</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="text-green-600 font-medium">
                                {entry.percentile?.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-500">
                              {formatTime(entry.time_taken_seconds)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No leaderboard data available</p>
                )}
              </CardContent>
            </Card>

            {/* CTA to take more mocks */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="p-8 text-center">
                <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Ready to climb higher?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Every mock test is a chance to improve. Practice more, track your progress, and dominate the leaderboard!
                </p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8"
                >
                  Take Another Mock
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-16 text-center">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Leaderboard Data Yet</h2>
              <p className="text-gray-500 mb-6">Be the first to appear on the {subject} leaderboard!</p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-cta hover:bg-cta-hover text-white"
              >
                Take a Mock Test
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
