import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Trophy, TrendingUp, TrendingDown, Target, Clock, CheckCircle,
  XCircle, MinusCircle, ChevronRight, Award, BarChart3, Home,
  BookOpen, ArrowUp, ArrowDown
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ResultsPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const [result, setResult] = useState(location.state?.result || null);
  const [analytics, setAnalytics] = useState(null);
  const [solutions, setSolutions] = useState(null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [showRankReveal, setShowRankReveal] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!result) {
      fetchAnalytics();
    } else {
      // Show rank reveal animation then confetti
      setTimeout(() => {
        setShowRankReveal(false);
        if (result.percentile >= 50) setShowConfetti(true);
      }, 3000);
      if (result.percentile >= 50) setTimeout(() => setShowConfetti(false), 8000);
      fetchAnalytics();
    }
  }, [attemptId]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/attempt/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAnalytics(response.data.data);
        if (!result) {
          setResult({
            subject: response.data.data.subject,
            score: response.data.data.score,
            rank: response.data.data.rank,
            percentile: response.data.data.percentile,
            correct_count: response.data.data.correct_count,
            incorrect_count: response.data.data.incorrect_count,
            unattempted_count: response.data.data.unattempted_count,
            time_taken_seconds: response.data.data.total_time_seconds
          });
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setShowRankReveal(false), 3000);
    }
  };

  const fetchSolutions = async () => {
    if (solutions) return;
    try {
      const response = await axios.get(`${API}/analytics/solutions/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSolutions(response.data.data.solutions);
      }
    } catch (error) {
      console.error('Error fetching solutions:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-section flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  // Rank Reveal Animation
  if (showRankReveal && result) {
    const pctMsg = result.percentile >= 90 ? "Outstanding!" :
                   result.percentile >= 70 ? "Great job!" :
                   result.percentile >= 50 ? "Good effort!" : "Keep pushing!";
    return (
      <div className="min-h-screen bg-brand flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-pulse">
            <Trophy className="h-24 w-24 text-amber-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-2">Calculating Your Rank...</h1>
            <div className="text-7xl font-extrabold text-amber-400 animate-bounce my-6">
              #{result.rank}
            </div>
            <p className="text-2xl font-semibold text-amber-300 mb-2">{pctMsg}</p>
            <p className="text-lg text-white/70">
              {result.percentile.toFixed(1)}th Percentile &middot; {result.score}/250
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-section">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden" data-testid="confetti-overlay">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="absolute animate-bounce" style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              backgroundColor: ['#f59e0b','#3b82f6','#10b981','#ef4444','#8b5cf6','#ec4899'][Math.floor(Math.random()*6)],
              opacity: 0.8,
              transform: `rotate(${Math.random()*360}deg)`,
            }} />
          ))}
        </div>
      )}
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center">
              <img src="/logo-full.png" alt="Crack CUET" className="h-8 md:h-10" />
            </Link>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Summary */}
        <Card className="border-0 shadow-xl mb-8 overflow-hidden">
          <div className="bg-brand p-8">
            <div className="grid md:grid-cols-4 gap-6 text-white text-center">
              <div>
                <p className="text-white/60 text-sm mb-1">Your Score</p>
                <p className="text-4xl font-extrabold">{result.score}/250</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">National Rank</p>
                <p className="text-4xl font-extrabold text-amber-400">#{result.rank}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Percentile</p>
                <p className="text-4xl font-extrabold text-green-400">{result.percentile.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Time Taken</p>
                <p className="text-4xl font-extrabold">{formatTime(result.time_taken_seconds)}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">{result.correct_count} Correct</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600 font-medium">{result.incorrect_count} Incorrect</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MinusCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 font-medium">{result.unattempted_count} Unattempted</span>
                </div>
              </div>
              
              {/* Badges Earned */}
              {result.badges_earned && result.badges_earned.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  {result.badges_earned.map((badge, idx) => (
                    <Badge key={idx} className="bg-amber-100 text-amber-700 border-0">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Percentile Message */}
            {result.percentile_message && (
              <div className="mt-4 p-4 bg-cta/10 rounded-xl">
                <p className="text-cta font-medium text-center">{result.percentile_message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Analytics and Solutions */}
        <Tabs defaultValue="analytics" className="space-y-6" onValueChange={(v) => v === 'solutions' && fetchSolutions()}>
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cta data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="solutions" className="data-[state=active]:bg-cta data-[state=active]:text-white">
              <BookOpen className="h-4 w-4 mr-2" />
              Solutions
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <>
                {/* Topic Breakdown */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Topic-wise Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topic_breakdown.map((topic, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-primary">{topic.topic}</span>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-green-600">{topic.correct} correct</span>
                              <span className="text-red-600">{topic.incorrect} wrong</span>
                              <span className="text-gray-500">{topic.unattempted} skipped</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Progress value={topic.accuracy} className="flex-1 h-2" />
                            <span className={`font-bold ${
                              topic.accuracy >= 70 ? 'text-green-600' :
                              topic.accuracy >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {topic.accuracy.toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Avg time: {topic.avg_time_seconds.toFixed(0)}s per question
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths and Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-600">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Your Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.strengths.length > 0 ? (
                        <ul className="space-y-2">
                          {analytics.strengths.map((topic, idx) => (
                            <li key={idx} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-700">{topic}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">Keep practicing to identify your strong areas!</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center text-red-600">
                        <TrendingDown className="h-5 w-5 mr-2" />
                        Areas to Improve
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.weaknesses.length > 0 ? (
                        <ul className="space-y-2">
                          {analytics.weaknesses.map((topic, idx) => (
                            <li key={idx} className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                              <Target className="h-4 w-4 text-red-500" />
                              <span className="text-red-700">{topic}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">Great job! No weak areas identified.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Solutions Tab */}
          <TabsContent value="solutions">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Answer Key & Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                {solutions ? (
                  <div className="space-y-6">
                    {solutions.map((sol, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border-2 ${
                        sol.is_correct === true ? 'border-green-200 bg-green-50' :
                        sol.is_correct === false ? 'border-red-200 bg-red-50' :
                        'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`border-0 ${
                            sol.is_correct === true ? 'bg-green-200 text-green-700' :
                            sol.is_correct === false ? 'bg-red-200 text-red-700' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            Q{idx + 1} - {sol.is_correct === true ? 'Correct' : sol.is_correct === false ? 'Incorrect' : 'Unattempted'}
                          </Badge>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{sol.topic}</span>
                            <Badge variant="outline" className="capitalize">{sol.difficulty}</Badge>
                          </div>
                        </div>

                        {sol.diagram_ascii && (
                          <div className="mb-3 p-3 rounded-lg border border-gray-200 bg-white">
                            <pre className="text-sm text-gray-800 whitespace-pre leading-relaxed font-mono">{sol.diagram_ascii}</pre>
                          </div>
                        )}

                        <p className="font-medium text-primary mb-4">{sol.question_text}</p>

                        <div className="space-y-2 mb-4">
                          {sol.options.map((opt, optIdx) => (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-lg flex items-center space-x-3 ${
                                opt.is_correct ? 'bg-green-100 border border-green-300' :
                                sol.selected_option_id === opt.id ? 'bg-red-100 border border-red-300' :
                                'bg-white border border-gray-200'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                opt.is_correct ? 'bg-green-500 text-white' :
                                sol.selected_option_id === opt.id ? 'bg-red-500 text-white' :
                                'bg-gray-200 text-gray-600'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className={`flex-1 ${
                                opt.is_correct ? 'text-green-700 font-medium' :
                                sol.selected_option_id === opt.id ? 'text-red-700' :
                                'text-gray-700'
                              }`}>
                                {opt.text}
                              </span>
                              {opt.is_correct && <CheckCircle className="h-5 w-5 text-green-500" />}
                              {sol.selected_option_id === opt.id && !opt.is_correct && <XCircle className="h-5 w-5 text-red-500" />}
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-700 mb-1">Explanation:</p>
                          <p className="text-sm text-blue-800">{sol.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-cta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading solutions...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8" data-testid="results-actions">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="px-8"
            data-testid="back-to-dashboard-btn"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate(`/leaderboard/${encodeURIComponent(analytics?.subject || result?.subject || 'Physics')}`)}
            className="bg-cta hover:bg-cta-hover text-white px-8"
            data-testid="view-leaderboard-btn"
          >
            <Trophy className="h-4 w-4 mr-2" />
            View Leaderboard
          </Button>
        </div>
      </main>
    </div>
  );
}
