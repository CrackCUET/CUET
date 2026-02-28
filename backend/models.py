"""Database models for CUET Mock Test Platform"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from enum import Enum

# Enums
class PlanType(str, Enum):
    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class TestStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

# User Models
class UserPreferences(BaseModel):
    domain_subjects: List[str] = []
    language: str = "English"
    onboarding_completed: bool = False

class UserProfile(BaseModel):
    """Additional profile info for conversion tracking"""
    whatsapp: Optional[str] = None
    target_degree: Optional[str] = None
    target_cuet_score: Optional[int] = None
    dream_schools: List[str] = []

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    name: str
    plan: PlanType = PlanType.FREE
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    profile: UserProfile = Field(default_factory=UserProfile)
    # Track free mocks used per subject (one free mock per subject)
    free_mocks_used: Dict[str, int] = {}  # subject -> count
    mocks_taken_this_month: int = 0
    total_mocks_taken: int = 0
    streak_days: int = 0
    last_active_date: Optional[str] = None
    badges: List[str] = []
    # Subscription info
    subscription_start: Optional[datetime] = None
    subscription_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    plan: PlanType
    preferences: UserPreferences
    mocks_taken_this_month: int
    total_mocks_taken: int
    streak_days: int
    badges: List[str]

# Question Models
class QuestionOption(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    is_correct: bool = False

class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subject: str
    topic: str
    chapter: str
    question_text: str
    options: List[QuestionOption]
    correct_option_id: str
    explanation: str
    difficulty: DifficultyLevel
    marks: int = 5
    negative_marks: int = 1
    has_diagram: bool = False
    diagram_ascii: Optional[str] = None
    # Legacy field (no longer shown in UI)
    diagram_description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Mock Test Models
class MockTest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subject: str
    title: str
    description: str
    total_questions: int = 50
    total_marks: int = 250
    duration_minutes: int = 60
    question_ids: List[str] = []
    difficulty_distribution: Dict[str, int] = {"easy": 10, "medium": 15, "hard": 25}
    is_active: bool = True
    question_generation_status: str = "not_started"  # not_started|in_progress|ready|failed
    question_generation_started_at: Optional[datetime] = None
    question_generation_completed_at: Optional[datetime] = None
    question_generation_error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MockTestResponse(BaseModel):
    id: str
    subject: str
    title: str
    description: str
    total_questions: int
    total_marks: int
    duration_minutes: int
    is_active: bool

# Test Attempt Models
class QuestionAttempt(BaseModel):
    question_id: str
    selected_option_id: Optional[str] = None
    is_correct: Optional[bool] = None
    time_spent_seconds: int = 0
    is_flagged: bool = False

class TestAttempt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mock_test_id: str
    subject: str
    status: TestStatus = TestStatus.NOT_STARTED
    question_attempts: List[QuestionAttempt] = []
    current_question_index: int = 0
    score: int = 0
    correct_count: int = 0
    incorrect_count: int = 0
    unattempted_count: int = 50
    time_remaining_seconds: int = 3600
    total_time_spent_seconds: int = 0
    rank: Optional[int] = None
    percentile: Optional[float] = None
    is_reattempt: bool = False
    original_attempt_id: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TestAttemptCreate(BaseModel):
    mock_test_id: str

class AnswerSubmission(BaseModel):
    question_id: str
    selected_option_id: Optional[str] = None
    time_spent_seconds: int = 0

class TestSubmission(BaseModel):
    attempt_id: str
    answers: List[AnswerSubmission]

# Leaderboard Models
class LeaderboardEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    subject: str
    mock_test_id: str
    attempt_id: str
    score: int
    time_taken_seconds: int
    rank: int
    percentile: float
    is_synthetic: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LeaderboardResponse(BaseModel):
    rank: int
    user_name: str
    score: int
    time_taken_seconds: int
    percentile: float
    is_current_user: bool = False

# Analytics Models
class TopicAnalytics(BaseModel):
    topic: str
    total_questions: int
    correct: int
    incorrect: int
    unattempted: int
    accuracy: float
    avg_time_seconds: float

class TestAnalytics(BaseModel):
    attempt_id: str
    score: int
    total_marks: int
    rank: int
    percentile: float
    correct_count: int
    incorrect_count: int
    unattempted_count: int
    total_time_seconds: int
    avg_time_per_question: float
    topic_breakdown: List[TopicAnalytics]
    strengths: List[str]
    weaknesses: List[str]

# Subject Configuration
class SubjectConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    category: str  # Domain, Language, General
    syllabus: Dict[str, List[str]] = {}  # chapter -> topics
    is_active: bool = True
    total_questions_in_bank: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Onboarding Models
class OnboardingRequest(BaseModel):
    domain_subjects: List[str]
    language: str

# API Response Models
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
