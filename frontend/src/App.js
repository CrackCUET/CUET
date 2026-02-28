import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import MockTestPage from "./pages/MockTestPage";
import ResultsPage from "./pages/ResultsPage";
import LeaderboardSubjectsPage from "./pages/LeaderboardSubjectsPage";
import SubjectLeaderboardPage from "./pages/SubjectLeaderboardPage";
import UpgradePage from "./pages/UpgradePage";
import AdminPage from "./pages/AdminPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import TermsPage from "./pages/TermsPage";
import BlogListPage from "./pages/BlogListPage";
import BlogBestMocks from "./pages/BlogBestMocks";
import Blog99Percentile from "./pages/Blog99Percentile";
import BlogSRCCAdmission from "./pages/BlogSRCCAdmission";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-section flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cta border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Auth Route - redirect to dashboard if already logged in
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-section flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cta border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/blog" element={<BlogListPage />} />
      <Route path="/blog/best-cuet-mock-tests-2025" element={<BlogBestMocks />} />
      <Route path="/blog/how-to-score-99-percentile-cuet" element={<Blog99Percentile />} />
      <Route path="/blog/how-to-get-into-srcc-stephens-hindu-college" element={<BlogSRCCAdmission />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/auth" element={
        <AuthRoute>
          <AuthPage />
        </AuthRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/mock/:mockId" element={
        <ProtectedRoute>
          <MockTestPage />
        </ProtectedRoute>
      } />
      <Route path="/results/:attemptId" element={
        <ProtectedRoute>
          <ResultsPage />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard/:subject" element={
        <ProtectedRoute>
          <SubjectLeaderboardPage />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <LeaderboardSubjectsPage />
        </ProtectedRoute>
      } />
      <Route path="/upgrade" element={
        <ProtectedRoute>
          <UpgradePage />
        </ProtectedRoute>
      } />
      
      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
