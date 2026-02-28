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
  Home, Users, Target, Clock, ChevronRight
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SUBJECTS = [
  "Physics", "Chemistry", "Mathematics", "Biology",
  "Economics", "Business Studies", "Accountancy",
  "History", "Political Science", "Geography",
  "Computer Science", "Psychology", "Sociology",
  "English", "Hindi", "General Aptitude Test"
];

export default function LeaderboardPage() {
  const { subject: initialSubject } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [subject, setSubject] = useState(initialSubject || 'Physics');
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [subject]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/leaderboard/${subject}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-amber-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-100 to-amber-50 border-amber-300';
    if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="min-h-screen bg-section">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center">
              <img src="/logo-full.png" alt="Crack CUET" className="h-8 md:h-10" />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-brand">Dashboard</Link>
              <span className="text-sm font-medium text-cta">Leaderboard</span>
            </nav>

            <Button onClick={() => navigate('/dashboard')} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Subject Selector */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center">
              <Trophy className="h-8 w-8 text-amber-500 mr-3" />
              Nationwide Leaderboard
            </h1>
            <p className="text-gray-600 mt-1">See how you rank against aspirants across India</p>
          </div>

          <Select value={subject} onValueChange={(v) => { setSubject(v); navigate(`/leaderboard/${v}`); }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-cta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : leaderboardData ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Leaderboard */}
            <div className="lg:col-span-2 space-y-6">
              {/* Total Participants */}
              <Card className="border-0 shadow-sm bg-brand text-white">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6" />
                    <span className="font-medium">Total Participants</span>
                  </div>
                  <span className="text-2xl font-bold">{leaderboardData.total_participants?.toLocaleString() || 0}</span>
                </CardContent>
              </Card>

              {/* Top 10 */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="h-5 w-5 text-amber-500 mr-2" />
                    Top 10 Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboardData.top_performers && leaderboardData.top_performers.length > 0 ? (
                    <div className="space-y-3">
                      {leaderboardData.top_performers.map((entry, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            entry.is_current_user
                              ? 'border-cta bg-cta/5 shadow-md'
                              : getRankBg(entry.rank)
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 flex items-center justify-center">
                              {getRankIcon(entry.rank)}
                            </div>
                            <div>
                              <p className={`font-semibold ${
                                entry.is_current_user ? 'text-cta' : 'text-primary'
                              }`}>
                                {entry.user_name}
                                {entry.is_current_user && (
                                  <Badge className="ml-2 bg-cta text-white border-0">You</Badge>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                Time: {formatTime(entry.time_taken_seconds)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">{entry.score}/250</p>
                            <p className="text-sm text-green-600 font-medium">
                              {entry.percentile.toFixed(1)}%ile
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No data available yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Nearby Ranks */}
              {leaderboardData.nearby_ranks && leaderboardData.nearby_ranks.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 text-cta mr-2" />
                      Your Competition Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {leaderboardData.nearby_ranks.map((entry, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            entry.is_current_user
                              ? 'bg-cta/10 border-2 border-cta'
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`font-bold ${
                              entry.is_current_user ? 'text-cta' : 'text-gray-500'
                            }`}>
                              #{entry.rank}
                            </span>
                            <span className={entry.is_current_user ? 'font-semibold text-cta' : 'text-primary'}>
                              {entry.user_name}
                              {entry.is_current_user && ' (You)'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-semibold text-primary">{entry.score}</span>
                            <span className="text-sm text-gray-500">{formatTime(entry.time_taken_seconds)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - User Stats */}
            <div className="space-y-6">
              {leaderboardData.user_stats ? (
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="bg-brand p-6 text-white text-center">
                    <p className="text-white/60 text-sm mb-1">Your Rank</p>
                    <p className="text-5xl font-extrabold text-amber-400">#{leaderboardData.user_stats.rank}</p>
                    <p className="text-white/80 mt-2">out of {leaderboardData.total_participants?.toLocaleString()}</p>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Your Score</span>
                      <span className="font-bold text-primary">{leaderboardData.user_stats.score}/250</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-600">Percentile</span>
                      <span className="font-bold text-green-600">{leaderboardData.user_stats.percentile.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Attempts</span>
                      <span className="font-bold text-primary">{leaderboardData.user_stats.attempts_count}</span>
                    </div>

                    {/* Motivational Message */}
                    <div className="p-4 bg-cta/10 rounded-xl">
                      <p className="text-sm text-cta font-medium text-center">
                        You're ahead of {leaderboardData.user_stats.percentile.toFixed(1)}% of aspirants!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't attempted any {subject} mocks yet.</p>
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

              {/* Next Rank Card */}
              {leaderboardData.user_stats && leaderboardData.user_stats.rank > 1 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-primary mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                      Chase the Next Rank
                    </h3>
                    <p className="text-sm text-gray-600">
                      Score <span className="font-bold text-cta">+5 more marks</span> to climb higher on the leaderboard!
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* CTA */}
              <Card className="border-0 shadow-sm bg-amber-50">
                <CardContent className="p-6 text-center">
                  <Crown className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                  <h3 className="font-bold text-primary mb-2">Want to reach Top 10?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Practice more mocks and track your improvement.
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Start Practicing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-16 text-center">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-primary mb-2">No Leaderboard Data Yet</h2>
              <p className="text-gray-500 mb-6">Be the first to appear on the {subject} leaderboard!</p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-cta hover:bg-cta-hover text-white"
              >
                Take a Mock Test
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
