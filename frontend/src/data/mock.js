// Mock data for CUET Mock Test Platform

// Available CUET Subjects
export const CUET_SUBJECTS = {
  domain: [
    { name: "Physics", code: "PHY" },
    { name: "Chemistry", code: "CHE" },
    { name: "Mathematics", code: "MAT" },
    { name: "Biology", code: "BIO" },
    { name: "Economics", code: "ECO" },
    { name: "Business Studies", code: "BST" },
    { name: "Accountancy", code: "ACC" },
    { name: "History", code: "HIS" },
    { name: "Political Science", code: "POL" },
    { name: "Geography", code: "GEO" },
    { name: "Computer Science", code: "CSC" },
    { name: "Psychology", code: "PSY" },
    { name: "Sociology", code: "SOC" }
  ],
  language: [
    { name: "English", code: "ENG" },
    { name: "Hindi", code: "HIN" }
  ],
  general: [
    { name: "General Aptitude Test", code: "GAT" }
  ]
};

// Sample Mock Tests
export const mockTests = [
  {
    id: "mock_physics_1",
    subject: "Physics",
    title: "Physics - Mock Test 1",
    description: "Full-length Physics mock test with 50 questions covering all chapters",
    total_questions: 50,
    total_marks: 250,
    duration_minutes: 60,
    is_active: true
  },
  {
    id: "mock_chemistry_1",
    subject: "Chemistry",
    title: "Chemistry - Mock Test 1",
    description: "Full-length Chemistry mock test with 50 questions",
    total_questions: 50,
    total_marks: 250,
    duration_minutes: 60,
    is_active: true
  },
  {
    id: "mock_math_1",
    subject: "Mathematics",
    title: "Mathematics - Mock Test 1",
    description: "Full-length Mathematics mock test with 50 questions",
    total_questions: 50,
    total_marks: 250,
    duration_minutes: 60,
    is_active: true
  }
];

// Sample Questions for Mock Test
export const sampleQuestions = [
  {
    id: "q1",
    question_text: "An infinitely long wire is charged uniformly with charge density λ and placed in air. The electric field at distance r from wire will be:",
    options: [
      { id: "q1_a", text: "λ/(2πε₀r)" },
      { id: "q1_b", text: "λ/(4πε₀r)" },
      { id: "q1_c", text: "λ/(2πr)" },
      { id: "q1_d", text: "λ/(4πr)" }
    ],
    marks: 5,
    negative_marks: 1
  },
  {
    id: "q2",
    question_text: "Why is the iron core of a transformer made laminated instead of being in one solid piece?",
    options: [
      { id: "q2_a", text: "To reduce the magnetic field link losses" },
      { id: "q2_b", text: "To reduce the loss due to heating of coils" },
      { id: "q2_c", text: "To reduce the hysteresis losses" },
      { id: "q2_d", text: "To reduce the losses due to eddy currents" }
    ],
    marks: 5,
    negative_marks: 1
  },
  {
    id: "q3",
    question_text: "A 50 Hz AC is rectified with full wave rectifier. What is the output frequency?",
    options: [
      { id: "q3_a", text: "100 Hz" },
      { id: "q3_b", text: "50 Hz" },
      { id: "q3_c", text: "200 Hz" },
      { id: "q3_d", text: "25 Hz" }
    ],
    marks: 5,
    negative_marks: 1
  }
];

// Sample Leaderboard Data
export const sampleLeaderboard = {
  top_performers: [
    { rank: 1, user_name: "Aarav S.", score: 242, time_taken_seconds: 2850, percentile: 99.9, is_current_user: false },
    { rank: 2, user_name: "Priya M.", score: 238, time_taken_seconds: 2900, percentile: 99.8, is_current_user: false },
    { rank: 3, user_name: "Arjun K.", score: 235, time_taken_seconds: 2920, percentile: 99.7, is_current_user: false },
    { rank: 4, user_name: "Ananya R.", score: 232, time_taken_seconds: 2980, percentile: 99.6, is_current_user: false },
    { rank: 5, user_name: "Vihaan P.", score: 228, time_taken_seconds: 3000, percentile: 99.5, is_current_user: false },
    { rank: 6, user_name: "Ishaan D.", score: 225, time_taken_seconds: 3050, percentile: 99.4, is_current_user: false },
    { rank: 7, user_name: "Aanya S.", score: 222, time_taken_seconds: 3100, percentile: 99.3, is_current_user: false },
    { rank: 8, user_name: "Advait G.", score: 218, time_taken_seconds: 3150, percentile: 99.2, is_current_user: false },
    { rank: 9, user_name: "Diya T.", score: 215, time_taken_seconds: 3200, percentile: 99.1, is_current_user: false },
    { rank: 10, user_name: "Reyansh M.", score: 212, time_taken_seconds: 3250, percentile: 99.0, is_current_user: false }
  ],
  user_stats: {
    rank: 45,
    score: 185,
    percentile: 95.5,
    attempts_count: 3
  },
  nearby_ranks: [
    { rank: 42, user_name: "Kabir J.", score: 188, time_taken_seconds: 3400, percentile: 96.0, is_current_user: false },
    { rank: 43, user_name: "Avni P.", score: 187, time_taken_seconds: 3420, percentile: 95.8, is_current_user: false },
    { rank: 44, user_name: "Shaurya B.", score: 186, time_taken_seconds: 3450, percentile: 95.6, is_current_user: false },
    { rank: 45, user_name: "You", score: 185, time_taken_seconds: 3480, percentile: 95.5, is_current_user: true },
    { rank: 46, user_name: "Myra V.", score: 184, time_taken_seconds: 3500, percentile: 95.3, is_current_user: false },
    { rank: 47, user_name: "Aditya N.", score: 183, time_taken_seconds: 3520, percentile: 95.1, is_current_user: false },
    { rank: 48, user_name: "Kiara S.", score: 182, time_taken_seconds: 3550, percentile: 95.0, is_current_user: false }
  ],
  total_participants: 1000
};

// Sample Analytics Data
export const sampleAnalytics = {
  attempt_id: "attempt_1",
  score: 185,
  total_marks: 250,
  rank: 45,
  percentile: 95.5,
  correct_count: 38,
  incorrect_count: 7,
  unattempted_count: 5,
  total_time_seconds: 3480,
  avg_time_per_question: 69.6,
  topic_breakdown: [
    { topic: "Electrostatics", total_questions: 8, correct: 7, incorrect: 1, unattempted: 0, accuracy: 87.5, avg_time_seconds: 65 },
    { topic: "Current Electricity", total_questions: 6, correct: 5, incorrect: 0, unattempted: 1, accuracy: 83.3, avg_time_seconds: 72 },
    { topic: "Magnetic Effects", total_questions: 7, correct: 5, incorrect: 1, unattempted: 1, accuracy: 71.4, avg_time_seconds: 80 },
    { topic: "Electromagnetic Induction", total_questions: 5, correct: 4, incorrect: 1, unattempted: 0, accuracy: 80.0, avg_time_seconds: 68 },
    { topic: "Optics", total_questions: 8, correct: 6, incorrect: 2, unattempted: 0, accuracy: 75.0, avg_time_seconds: 70 },
    { topic: "Modern Physics", total_questions: 8, correct: 5, incorrect: 1, unattempted: 2, accuracy: 62.5, avg_time_seconds: 75 },
    { topic: "Electronic Devices", total_questions: 8, correct: 6, incorrect: 1, unattempted: 1, accuracy: 75.0, avg_time_seconds: 65 }
  ],
  strengths: ["Electrostatics", "Current Electricity", "Electromagnetic Induction"],
  weaknesses: ["Modern Physics"]
};

// Sample User Data
export const sampleUser = {
  id: "user_1",
  email: "student@example.com",
  name: "Rahul Sharma",
  plan: "starter",
  preferences: {
    domain_subjects: ["Physics", "Chemistry", "Mathematics"],
    language: "English",
    onboarding_completed: true
  },
  mocks_taken_this_month: 12,
  total_mocks_taken: 45,
  streak_days: 7,
  badges: ["7-Day Streak", "Top 5% Performer"]
};

// Landing page data
export const navLinks = [
  { id: 'how-it-works', label: 'How It Works', href: '/how-it-works', isRoute: true },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'blog', label: 'Blog', href: '/blog', isRoute: true },
  { id: 'reviews', label: 'Reviews', href: '#reviews' },
  { id: 'faqs', label: 'FAQs', href: '#faqs' }
];

export const heroBullets = [
  'Real CUET exam-level simulations',
  'Nationwide leaderboard after every mock',
  'Smart analytics to fix weak areas faster'
];

export const painPoints = [
  { id: 1, icon: 'AlertTriangle', title: 'Unrealistic difficulty & poor exam simulation' },
  { id: 2, icon: 'Users', title: 'No real competition or ranking' },
  { id: 3, icon: 'Lock', title: 'Limited mock attempts behind paywalls' },
  { id: 4, icon: 'BarChart2', title: 'Scores without actionable insights' },
  { id: 5, icon: 'Globe', title: 'No way to measure yourself nationally' }
];

export const features = [
  { id: 1, icon: 'FileText', title: 'Real-exam simulated mocks', description: 'Practice with mocks that mirror actual CUET difficulty, timing, and question patterns.' },
  { id: 2, icon: 'Trophy', title: 'Nationwide leaderboard', description: 'Compare your performance against thousands of aspirants across India after every mock.' },
  { id: 3, icon: 'Infinity', title: 'Unlimited practice', description: 'Pro plan gives you unlimited mock attempts — practice until you perfect every topic.' },
  { id: 4, icon: 'PieChart', title: 'Topic-level analytics', description: 'Deep dive into topic-wise performance and time analysis to identify improvement areas.' },
  { id: 5, icon: 'Award', title: 'Weekly challenges & badges', description: 'Compete in weekly challenges and earn performance badges to stay motivated.' },
  { id: 6, icon: 'Target', title: 'Peer benchmarking', description: 'See how you stack up against top scorers and learn from their performance patterns.' },
  { id: 7, icon: 'RotateCcw', title: 'One-click reattempt', description: 'Instantly reattempt mocks with mistake tracking to reinforce learning.' },
  { id: 8, icon: 'Bookmark', title: 'Mistake tracking', description: 'Track and review all your mistakes in one place for targeted revision.' }
];

export const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Get started for free',
    features: ['1 free mock per subject', 'Basic analytics', 'Limited leaderboard view', 'Solution explanations'],
    cta: 'Start Free',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹999',
    period: '/month',
    description: 'Best for serious aspirants',
    features: ['8 mocks per subject/month', 'Full leaderboard access', 'Weak-topic breakdown', 'AI-powered feedback', 'Priority support'],
    cta: 'Go Pro',
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹1,499',
    period: '/month',
    description: 'For competitive excellence',
    features: ['10 mocks per subject/month', 'Everything in Pro', 'Rank prediction', 'Performance comparison', 'Detailed performance reports'],
    cta: 'Go Premium',
    popular: false
  }
];

export const testimonials = [
  { id: 1, name: 'Priya Sharma', city: 'Delhi', achievement: 'Improved from 85th to 98.5th percentile', review: 'The nationwide leaderboard kept me motivated. Seeing my rank improve week by week was incredibly satisfying. The analytics helped me identify exactly where I was losing marks.', rating: 5, avatar: 'PS' },
  { id: 2, name: 'Arjun Patel', city: 'Mumbai', achievement: 'Scored 99.2 percentile in CUET', review: 'Unlike other platforms, the mocks here actually feel like the real exam. The difficulty level and time pressure prepared me perfectly. Worth every rupee.', rating: 5, avatar: 'AP' },
  { id: 3, name: 'Sneha Reddy', city: 'Hyderabad', achievement: 'Jumped 150+ ranks in 2 months', review: 'The weekly challenges pushed me to stay consistent. Competing with students across India made me take my preparation seriously. Highly recommend the Pro plan.', rating: 5, avatar: 'SR' }
];

export const faqs = [
  { id: 1, question: 'Can I try before paying?', answer: 'Yes! You can attempt 1 full-length mock test completely free. No credit card required. Just sign up and start practicing immediately.' },
  { id: 2, question: 'Are mocks updated to the latest CUET pattern?', answer: 'Absolutely. Our expert team continuously updates all mocks to reflect the latest CUET exam pattern, difficulty level, and question types.' },
  { id: 3, question: 'How does the leaderboard work?', answer: 'After completing each mock, your score is compared against all students who attempted that mock. You get a nationwide rank and percentile.' },
  { id: 4, question: 'What is the difference between Starter and Pro plans?', answer: 'Starter plan offers 40 mocks per month with basic analytics. Pro plan gives unlimited mocks, advanced topic-wise analytics, weekly challenges, and priority leaderboard badges.' },
  { id: 5, question: 'Is there a refund policy?', answer: 'Yes, we offer a 7-day money-back guarantee. If you\'re not satisfied within 7 days of purchase, contact us for a full refund.' },
  { id: 6, question: 'Are detailed solutions provided for each question?', answer: 'Yes, every question comes with a detailed solution explaining the correct answer, common mistakes, and the concept being tested.' },
  { id: 7, question: 'Is this platform useful alongside coaching?', answer: 'Definitely! Our platform complements any coaching program. We focus purely on practice and performance analytics.' }
];

export const stats = [
  { id: 1, value: '460+', label: 'Active Students' },
  { id: 2, value: 'Unlimited', label: 'AI-Generated Mocks' },
  { id: 3, value: '100%', label: 'Improved Scores' },
  { id: 4, value: '240', label: 'Mock Tests' }
];
