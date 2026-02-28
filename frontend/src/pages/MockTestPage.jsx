import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '../components/ui/dialog';
import {
  Clock, Flag, ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle, Send, BookOpen, Sparkles, Brain, Target, Zap
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Motivational messages for the AI generating screen
const MOTIVATIONAL_MESSAGES = [
  { icon: "🎯", text: "Curating questions tailored to your CUET preparation..." },
  { icon: "🧠", text: "Analyzing question patterns from previous years..." },
  { icon: "⚡", text: "Generating challenging yet achievable questions..." },
  { icon: "📊", text: "Balancing difficulty levels for optimal learning..." },
  { icon: "🎓", text: "Preparing questions that top rankers practice..." },
  { icon: "💪", text: "Building your path to 99.9 percentile..." },
  { icon: "🔥", text: "Creating questions to boost your confidence..." },
  { icon: "🌟", text: "Almost ready! Your personalized mock awaits..." },
];

// AI Generating Animation Component
function AIGeneratingScreen({ subject, progress }) {
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentMessage = MOTIVATIONAL_MESSAGES[messageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated Brain Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
            {/* Middle pulsing ring */}
            <div className="absolute inset-2 border-4 border-cyan-400/40 rounded-full animate-pulse"></div>
            {/* Inner rotating ring */}
            <div className="absolute inset-4 border-4 border-pink-500/30 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/50">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">
          AI is Creating Your Mock
        </h1>
        <p className="text-purple-200 mb-8">
          {subject} • 50 Questions
        </p>

        {/* Progress Bar */}
        <div className="mb-8 px-8">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-full transition-all duration-500 animate-pulse"
              style={{ width: `${Math.min(progress * 100, 95)}%` }}
            ></div>
          </div>
          <p className="text-white/60 text-sm mt-2">
            {progress < 0.3 ? 'Initializing...' : progress < 0.6 ? 'Generating questions...' : progress < 0.9 ? 'Finalizing...' : 'Almost ready!'}
          </p>
        </div>

        {/* Motivational Message */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10 transition-all duration-500">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-3xl">{currentMessage.icon}</span>
            <p className="text-white/90 text-lg font-medium">
              {currentMessage.text}
            </p>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <Sparkles className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <p className="text-white/60 text-xs">AI-Powered</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <Target className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <p className="text-white/60 text-xs">CUET Pattern</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <Zap className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-white/60 text-xs">Personalized</p>
          </div>
        </div>

        {/* Tip */}
        <p className="text-white/40 text-sm mt-8">
          💡 Tip: Take a deep breath and get ready to ace this!
        </p>
      </div>
    </div>
  );
}

export default function MockTestPage() {
  const { mockId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Test state
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mockSubject, setMockSubject] = useState('');
  const [testData, setTestData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [questionTimes, setQuestionTimes] = useState({});
  const questionStartTime = useRef(Date.now());

  // Dialog states
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Start the test
  useEffect(() => {
    startTest();
  }, [mockId]);

  // Timer
  useEffect(() => {
    if (!testData) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        if (prev === 300 && !showTimeWarning) {
          setShowTimeWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testData]);

  // Track time per question
  useEffect(() => {
    questionStartTime.current = Date.now();
    return () => {
      const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
      const qId = questions[currentQuestionIndex]?.id;
      if (qId) {
        setQuestionTimes(prev => ({
          ...prev,
          [qId]: (prev[qId] || 0) + timeSpent
        }));
      }
    };
  }, [currentQuestionIndex, questions]);

  const startTest = async () => {
    const minLoadTime = 8000; // minimum 8 seconds loading animation
    const startTime = Date.now();

    // Start progress animation (slower to fill 8s)
    setLoadingProgress(0);
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const target = Math.min(elapsed / minLoadTime, 0.92);
      setLoadingProgress(prev => {
        if (prev >= 0.95) return prev;
        return prev + (target - prev) * 0.15;
      });
    }, 300);

    try {
      // First, get mock info to show the subject
      try {
        const mockInfoResponse = await axios.get(`${API}/mocks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (mockInfoResponse.data?.success) {
          const mockInfo = mockInfoResponse.data.data.mocks?.find(m => m.id === mockId);
          if (mockInfo) {
            setMockSubject(mockInfo.subject);
          }
        }
      } catch (e) {
        // Ignore error, just use default subject
      }

      const maxAttempts = 30;
      let attempt = 0;
      let responseData = null;

      while (attempt < maxAttempts) {
        const response = await axios.post(
          `${API}/mocks/start`,
          { mock_test_id: mockId },
          {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: () => true
          }
        );

        if (response.status === 202) {
          setLoading(true);
          attempt += 1;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        if (response.data?.success) {
          responseData = response.data.data;
          break;
        }

        throw new Error(response.data?.detail || 'Failed to start test');
      }

      if (!responseData) {
        throw new Error('Mock generation is taking too long. Please try again.');
      }

      // Wait for minimum load time to complete
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed));
      }

      // Set progress to 100% and brief pause
      setLoadingProgress(1);
      await new Promise(resolve => setTimeout(resolve, 600));

      setTestData(responseData.mock_test);
      setAttemptId(responseData.attempt_id);
      setQuestions(responseData.questions);
      setTimeRemaining(responseData.time_remaining_seconds);

      const initialAnswers = {};
      responseData.questions.forEach(q => {
        initialAnswers[q.id] = null;
      });
      setAnswers(initialAnswers);
      clearInterval(progressInterval);
      return;
    } catch (error) {
      console.error('Error starting test:', error);
      alert(error.response?.data?.detail || error.message || 'Failed to start test');
      navigate('/dashboard');
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const toggleFlag = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const goToQuestion = (index) => {
    // Record time for current question before switching
    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
    const currentQId = questions[currentQuestionIndex]?.id;
    if (currentQId) {
      setQuestionTimes(prev => ({
        ...prev,
        [currentQId]: (prev[currentQId] || 0) + timeSpent
      }));
    }
    
    setCurrentQuestionIndex(index);
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setShowSubmitDialog(false);

    // Record final time for current question
    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
    const currentQId = questions[currentQuestionIndex]?.id;
    const finalQuestionTimes = {
      ...questionTimes,
      [currentQId]: (questionTimes[currentQId] || 0) + timeSpent
    };

    // Prepare submission
    const submissionAnswers = questions.map(q => ({
      question_id: q.id,
      selected_option_id: answers[q.id] || null,
      time_spent_seconds: finalQuestionTimes[q.id] || 0
    }));

    try {
      const response = await axios.post(
        `${API}/mocks/submit`,
        {
          attempt_id: attemptId,
          answers: submissionAnswers
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Navigate to results page
        navigate(`/results/${attemptId}`, { 
          state: { result: response.data.data } 
        });
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    const qId = questions[index]?.id;
    if (flaggedQuestions.has(qId)) return 'flagged';
    if (answers[qId]) return 'answered';
    return 'unanswered';
  };

  const getStats = () => {
    let answered = 0, flagged = 0, unanswered = 0;
    questions.forEach((q, idx) => {
      if (answers[q.id]) answered++;
      else unanswered++;
      if (flaggedQuestions.has(q.id)) flagged++;
    });
    return { answered, flagged, unanswered };
  };

  if (loading) {
    return (
      <AIGeneratingScreen 
        subject={mockSubject || 'Your Subject'} 
        progress={loadingProgress} 
      />
    );
  }


  if (!testData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-700">
          <p>Failed to load test. Please try again.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold text-gray-900">{testData.title}</span>
            <Badge className="bg-brand text-white border-0">
              {testData.subject}
            </Badge>
          </div>

          {/* Timer */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            timeRemaining <= 300 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
          </div>

          {/* Submit Button */}
          <Button
            onClick={() => setShowSubmitDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid="submit-test-btn"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Test
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Question Panel */}
        <div className="flex-1 p-6">
          <Card className="bg-white border-gray-200 shadow-sm h-full">
            <CardContent className="p-6">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Badge className="bg-cta text-white border-0">
                    Q{currentQuestionIndex + 1}/{questions.length}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    +{currentQuestion.marks} marks / -{currentQuestion.negative_marks} negative
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`${
                    flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-amber-50 text-amber-600 border-amber-300'
                      : 'text-gray-500 border-gray-300 hover:text-gray-700'
                  }`}
                  data-testid="flag-question-btn"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag for Review'}
                </Button>
              </div>

              {/* Passage (for comprehension questions) */}
              {currentQuestion.passage && (
                <div className="mb-6 p-5 rounded-xl border border-blue-200 bg-blue-50/50" data-testid="passage-block">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Reading Passage</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-line">
                    {currentQuestion.passage}
                  </p>
                </div>
              )}

              {/* Diagram (ASCII only) */}
              {currentQuestion.diagram_ascii && (
                <div className="mb-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <pre className="text-sm text-gray-800 whitespace-pre leading-relaxed font-mono">
                    {currentQuestion.diagram_ascii}
                  </pre>
                </div>
              )}

              {/* Question Text */}
              <div className="mb-8">
                <p className="text-xl text-gray-900 leading-relaxed">
                  {currentQuestion.question_text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={option.id}
                    onClick={() => selectAnswer(currentQuestion.id, option.id)}
                    data-testid={`option-${String.fromCharCode(65 + idx)}`}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      answers[currentQuestion.id] === option.id
                        ? 'border-blue-500 bg-blue-50 text-gray-900'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        answers[currentQuestion.id] === option.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{option.text}</span>
                      {answers[currentQuestion.id] === option.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="border-gray-300 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Previous
                </Button>

                {answers[currentQuestion.id] && (
                  <Button
                    variant="ghost"
                    onClick={() => selectAnswer(currentQuestion.id, null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear Response
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="border-gray-300 text-gray-600 hover:text-gray-900"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Navigator */}
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="text-gray-900 font-semibold mb-4">Question Navigator</h3>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.answered}</p>
              <p className="text-xs text-green-600">Answered</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
              <p className="text-2xl font-bold text-gray-500">{stats.unanswered}</p>
              <p className="text-xs text-gray-500">Unanswered</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.flagged}</p>
              <p className="text-xs text-amber-600">Flagged</p>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const status = getQuestionStatus(idx);
              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    idx === currentQuestionIndex
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : ''
                  } ${
                    status === 'answered'
                      ? 'bg-green-500 text-white'
                      : status === 'flagged'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
              <span className="text-gray-600">Unanswered</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span className="text-gray-600">Flagged for Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle>Submit Test</DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to submit your test? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">{stats.answered}</p>
                <p className="text-sm text-green-600">Answered</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-500">{stats.unanswered}</p>
                <p className="text-sm text-gray-500">Unanswered</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-2xl font-bold text-amber-600">{stats.flagged}</p>
                <p className="text-sm text-amber-600">Flagged</p>
              </div>
            </div>

            {stats.unanswered > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">You have {stats.unanswered} unanswered questions.</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
              className="border-gray-300 text-gray-600"
            >
              Continue Test
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Warning Dialog */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <span>5 Minutes Remaining!</span>
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              You have only 5 minutes left. Please review your answers and submit the test.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowTimeWarning(false)}
              className="bg-cta hover:bg-cta-hover text-white"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
