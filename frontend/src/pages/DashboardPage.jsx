import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Trophy, TrendingUp, BookOpen, Award,
  ChevronRight, Play, Crown, Zap, LogOut,
  Flame
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Subject tab configuration with colors and icons
const SUBJECT_CONFIG = {
  "English": { color: "bg-slate-500", icon: "📚" },
  "General Aptitude Test": { color: "bg-gray-500", icon: "🎯" },
  "Physics": { color: "bg-blue-500", icon: "⚛️" },
  "Chemistry": { color: "bg-green-500", icon: "🧪" },
  "Mathematics": { color: "bg-purple-500", icon: "📐" },
  "Biology": { color: "bg-emerald-500", icon: "🧬" },
  "Economics": { color: "bg-amber-500", icon: "📊" },
  "Business Studies": { color: "bg-orange-500", icon: "💼" },
  "Accountancy": { color: "bg-cyan-500", icon: "📒" },
  "History": { color: "bg-yellow-600", icon: "📜" },
  "Political Science": { color: "bg-red-500", icon: "🏛️" },
  "Geography": { color: "bg-teal-500", icon: "🌍" },
  "Computer Science": { color: "bg-indigo-500", icon: "💻" },
  "Psychology": { color: "bg-pink-500", icon: "🧠" },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, token, logout, isOnboarded } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);

  // All available subjects on the platform
  const ALL_SUBJECTS = [
    "English",
    "Physics", 
    "Chemistry",
    "Mathematics",
    "Biology",
    "History",
    "Political Science",
    "Geography",
    "Economics",
    "Business Studies",
    "Accountancy",
    "Psychology",
    "Computer Science",
    "Applied Mathematics",
    "General Aptitude Test"
  ];
  
  // User's subjects: English + domain subjects + GAT (5 total)
  const userSubjects = user?.preferences?.domain_subjects || user?.subjects || [];
  
  const tabSubjects = [
    "English",
    ...userSubjects,
    "General Aptitude Test"
  ].filter((v, i, a) => a.indexOf(v) === i);

  useEffect(() => {
    if (!isOnboarded) {
      navigate('/onboarding');
      return;
    }
    fetchDashboardData();
    fetchMocks();
  }, [isOnboarded, navigate]);

  useEffect(() => {
    // Set initial active tab when mocks are loaded
    if (mocks.length > 0 && !activeTab) {
      // Find first tab that has mocks
      for (const subject of tabSubjects) {
        if (mocks.some(m => m.subject === subject)) {
          setActiveTab(subject);
          break;
        }
      }
      // If no matching subject, use first available mock's subject
      if (!activeTab && mocks.length > 0) {
        const firstMockSubject = mocks[0].subject;
        if (!tabSubjects.includes(firstMockSubject)) {
          setActiveTab(tabSubjects[0] || firstMockSubject);
        }
      }
    }
  }, [mocks, tabSubjects]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchMocks = async () => {
    try {
      const response = await axios.get(`${API}/mocks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMocks(response.data.data.mocks || []);
      }
    } catch (error) {
      console.error('Error fetching mocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMock = (mockId) => {
    navigate(`/mock/${mockId}`);
  };

  const handleViewLeaderboard = (subject) => {
    navigate(`/leaderboard/${encodeURIComponent(subject)}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get mocks for the active tab
  const allTabMocks = mocks.filter(m => m.subject === activeTab);
  
  // Show only the next available mock (first unattempted one, or first one if all attempted)
  const unattemptedMocks = allTabMocks.filter(m => !m.attempts_count || m.attempts_count === 0);
  const nextAvailableMock = unattemptedMocks.length > 0 ? unattemptedMocks[0] : allTabMocks[0];
  const filteredMocks = nextAvailableMock ? [nextAvailableMock] : [];
  
  // Get all unique subjects from available mocks for tabs
  const availableSubjects = [...new Set(mocks.map(m => m.subject))];
  
  // Combine user's selected subjects with available ones
  const displayTabs = tabSubjects.filter(s => availableSubjects.includes(s));
  
  // If user's subjects don't have mocks, show all available subjects
  const finalTabs = displayTabs.length > 0 ? displayTabs : availableSubjects.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-section flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userData = dashboardData?.user || user;
  const mocksRemaining = dashboardData?.mocks_remaining;
  const streakDays = dashboardData?.streak_days || 0;
  const badges = dashboardData?.badges || [];
  const recentAttempts = dashboardData?.recent_attempts || [];
  const subjectPerformance = dashboardData?.subject_performance || {};

  const getSubjectConfig = (subject) => {
    return SUBJECT_CONFIG[subject] || { color: "bg-gray-500", icon: "📖" };
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
              <Link to="/dashboard" className="text-sm font-medium text-cta">Dashboard</Link>
              <Link to="/leaderboard" className="text-sm font-medium text-gray-600 hover:text-brand">Leaderboard</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Streak Badge */}
              {streakDays > 0 && (
                <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-medium">{streakDays} day streak</span>
                </div>
              )}
              
              {/* Plan Badge */}
              <Badge className={`${
                userData?.plan === 'premium' 
                  ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700' 
                  : userData?.plan === 'pro'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              } border-0`}>
                {userData?.plan === 'premium' ? (
                  <><Crown className="h-3 w-3 mr-1" /> Premium</>
                ) : userData?.plan === 'pro' ? (
                  <><Zap className="h-3 w-3 mr-1" /> Pro</>
                ) : (
                  'Free'
                )}
              </Badge>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-semibold">
                  {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Welcome back, {userData?.name?.split(' ')[0]}!</h1>
          <p className="text-gray-600 mt-1">Ready to push for that 99.9th percentile?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Available Mocks</p>
                  <p className="text-2xl font-bold text-primary">{mocks.length}</p>
                </div>
                <div className="w-12 h-12 bg-cta/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-cta" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Best Percentile</p>
                  <p className="text-2xl font-bold text-primary">
                    {Object.values(subjectPerformance).length > 0
                      ? Math.max(...Object.values(subjectPerformance).map(s => s.best_percentile || 0)).toFixed(1) + '%'
                      : '--'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Streak</p>
                  <p className="text-2xl font-bold text-primary">{streakDays} days</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Badges Earned</p>
                  <p className="text-2xl font-bold text-primary">{badges.length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Free Plan Upgrade Banner */}
        {userData?.plan === 'free' && (
          <Card className="border-0 shadow-sm mb-8 overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary">Free Plan</h3>
                  <p className="text-sm text-gray-600">1 free mock per subject • Upgrade for unlimited access</p>
                </div>
                <Button
                  onClick={() => navigate('/upgrade')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  View Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Mocks with Tabs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">Mock Tests</h2>
              <Button
                variant="outline"
                onClick={() => navigate('/leaderboard')}
                className="border-gray-300"
              >
                <Trophy className="h-4 w-4 mr-2" />
                View All Leaderboards
              </Button>
            </div>

            {/* Subject Tabs */}
            <div className="flex flex-wrap gap-2 mb-6" data-testid="subject-tabs">
              {finalTabs.map((subject) => {
                const config = getSubjectConfig(subject);
                const mockCount = mocks.filter(m => m.subject === subject).length;
                const isActive = activeTab === subject;
                
                return (
                  <button
                    key={subject}
                    onClick={() => setActiveTab(subject)}
                    data-testid={`tab-${subject.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                      isActive
                        ? `${config.color} text-white shadow-md scale-105`
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-sm">{subject}</span>
                    <Badge className={`${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'} border-0 text-xs`}>
                      Unlimited
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Next Available Mock */}
            <div className="space-y-3" data-testid="mock-list">
              {filteredMocks.length > 0 ? (
                <Card className="border-2 border-cta/20 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-white to-blue-50/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-14 h-14 ${getSubjectConfig(activeTab).color} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md`}>
                          {getSubjectConfig(activeTab).icon}
                        </div>
                        <div>
                          <p className="text-xs text-cta font-semibold uppercase tracking-wide mb-1">Next Available Mock</p>
                          <h3 className="font-bold text-lg text-primary">{filteredMocks[0].title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {filteredMocks[0].total_questions} Questions • {filteredMocks[0].duration_minutes} mins
                          </p>
                          {filteredMocks[0].attempts_count > 0 && (
                            <div className="flex items-center space-x-3 mt-2 text-xs">
                              <span className="text-gray-500">
                                Attempted {filteredMocks[0].attempts_count}x
                              </span>
                              {filteredMocks[0].best_score && (
                                <span className="text-green-600 font-medium">
                                  Best: {filteredMocks[0].best_score}/{filteredMocks[0].total_marks}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartMock(filteredMocks[0].id)}
                        size="lg"
                        className="bg-cta hover:bg-cta-hover text-white px-8 py-6 text-lg font-semibold shadow-md"
                        data-testid={`start-mock-${filteredMocks[0].id}`}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        {filteredMocks[0].attempts_count > 0 ? 'Retry' : 'Start Mock'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No mock tests available for {activeTab}.</p>
                    <p className="text-sm text-gray-400 mt-1">Select another subject or check back later.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Actions for Subject */}
            {activeTab && filteredMocks.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleViewLeaderboard(activeTab)}
                  className="border-gray-300"
                >
                  <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                  View {activeTab} Leaderboard
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Attempts */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Attempts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAttempts.length > 0 ? recentAttempts.slice(0, 5).map((attempt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-primary text-sm">{attempt.subject}</p>
                      <p className="text-xs text-gray-500">
                        Score: {attempt.score}/250
                      </p>
                    </div>
                    <div className="text-right">
                      {attempt.percentile && (
                        <Badge className="bg-cta/10 text-cta border-0">
                          {attempt.percentile.toFixed(1)}%ile
                        </Badge>
                      )}
                      {attempt.rank && (
                        <p className="text-xs text-gray-500 mt-1">Rank #{attempt.rank}</p>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No attempts yet. Start your first mock!</p>
                )}
              </CardContent>
            </Card>

            {/* Badges */}
            {badges.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge, idx) => (
                      <Badge key={idx} className="bg-amber-100 text-amber-700 border-0">
                        <Award className="h-3 w-3 mr-1" />
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upgrade Card (Free Plan) */}
            {userData?.plan === 'free' && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-6 w-6 text-amber-400" />
                    <h3 className="font-bold text-lg">Go Pro</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-4">
                    Get 8 mocks per subject/month, full leaderboard access, and AI-powered feedback.
                  </p>
                  <Button
                    onClick={() => navigate('/upgrade')}
                    className="w-full bg-white text-blue-600 hover:bg-gray-100"
                  >
                    View Plans
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
