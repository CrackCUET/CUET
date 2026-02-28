import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Trophy, Users, TrendingUp, ChevronRight, Home, Sparkles
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Subject icons/colors mapping
const SUBJECT_CONFIG = {
  "Physics": { color: "from-blue-500 to-blue-600", icon: "⚛️" },
  "Chemistry": { color: "from-green-500 to-green-600", icon: "🧪" },
  "Mathematics": { color: "from-purple-500 to-purple-600", icon: "📐" },
  "Biology": { color: "from-emerald-500 to-emerald-600", icon: "🧬" },
  "Economics": { color: "from-amber-500 to-amber-600", icon: "📊" },
  "Business Studies": { color: "from-orange-500 to-orange-600", icon: "💼" },
  "Accountancy": { color: "from-cyan-500 to-cyan-600", icon: "📒" },
  "History": { color: "from-yellow-600 to-yellow-700", icon: "📜" },
  "Political Science": { color: "from-red-500 to-red-600", icon: "🏛️" },
  "Geography": { color: "from-teal-500 to-teal-600", icon: "🌍" },
  "Computer Science": { color: "from-indigo-500 to-indigo-600", icon: "💻" },
  "Psychology": { color: "from-pink-500 to-pink-600", icon: "🧠" },
  "English": { color: "from-slate-500 to-slate-600", icon: "📚" },
  "General Aptitude Test": { color: "from-gray-500 to-gray-600", icon: "🎯" },
};

export default function LeaderboardSubjectsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [subjectsData, setSubjectsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjectsOverview();
  }, []);

  const fetchSubjectsOverview = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard/subjects/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSubjectsData(response.data.data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectConfig = (subject) => {
    return SUBJECT_CONFIG[subject] || { color: "from-gray-500 to-gray-600", icon: "📖" };
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
              <span className="text-sm font-medium text-cta">Leaderboard</span>
            </nav>

            <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg mb-6">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Nationwide Leaderboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a subject to see how you rank against aspirants across India. 
            Compete, improve, and climb to the top!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-cta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subjects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectsData.map((subject, idx) => {
              const config = getSubjectConfig(subject.subject);
              
              return (
                <Card
                  key={idx}
                  data-testid={`subject-card-${subject.subject.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  onClick={() => navigate(`/leaderboard/${encodeURIComponent(subject.subject)}`)}
                >
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-r ${config.color} p-5 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{config.icon}</span>
                        <h3 className="text-lg font-bold">{subject.subject}</h3>
                      </div>
                      <ChevronRight className="h-5 w-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Participants */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Participants</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {subject.total_participants?.toLocaleString() || 0}
                      </span>
                    </div>

                    {/* User's Percentile or CTA */}
                    {subject.has_attempted ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            <span>Your Percentile</span>
                          </div>
                          <span className="font-bold text-green-600">
                            {subject.user_percentile?.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <Trophy className="h-4 w-4 mr-2" />
                            <span>Your Rank</span>
                          </div>
                          <span className="font-bold text-amber-600">
                            #{subject.user_rank}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <Sparkles className="h-4 w-4 mr-2" />
                          <span>Your Rank</span>
                        </div>
                        <span className="text-gray-400 italic">Not attempted</span>
                      </div>
                    )}

                    {/* Motivational Message */}
                    <div className={`p-3 rounded-lg text-center text-sm font-medium ${
                      subject.has_attempted 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700'
                        : 'bg-gray-50 text-gray-600'
                    }`}>
                      {subject.motivational_message}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && subjectsData.length === 0 && (
          <Card className="border-0 shadow-sm max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Leaderboard Data Yet</h2>
              <p className="text-gray-500 mb-6">
                Be the first to appear on the leaderboard by taking a mock test!
              </p>
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
