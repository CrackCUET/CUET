"""CUET Mock Test Platform - Main Server"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, BackgroundTasks, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel as PydanticBaseModel
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
import asyncio

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import models and services
from models import (
    User, UserCreate, UserLogin, UserResponse, UserPreferences,
    Question, QuestionOption, MockTest, MockTestResponse,
    TestAttempt, TestAttemptCreate, AnswerSubmission, TestSubmission,
    LeaderboardEntry, LeaderboardResponse, TestAnalytics, TopicAnalytics,
    SubjectConfig, OnboardingRequest, APIResponse,
    PlanType, DifficultyLevel, TestStatus, QuestionAttempt
)
from auth import hash_password, verify_password, create_access_token, decode_access_token, get_current_user_id
from leaderboard_service import (
    generate_synthetic_leaderboard, calculate_rank_and_percentile,
    get_nearby_ranks, get_top_performers, calculate_rank_delta,
    calculate_next_rank_gap, get_percentile_message, assign_badges
)
from question_generator import QuestionGenerator, create_sample_questions

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'cuet_mock_platform')]

# Create the main app
app = FastAPI(title="CUET Mock Test Platform API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== Email Notification Service ====================
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
ADMIN_EMAIL = "info@crackCUET.com"
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

async def send_admin_email(subject: str, html_content: str):
    """Send notification email to admin. Fails silently if not configured."""
    if not RESEND_API_KEY:
        logger.warning(f"RESEND_API_KEY not set, skipping email: {subject}")
        return
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        params = {
            "from": SENDER_EMAIL,
            "to": [ADMIN_EMAIL],
            "subject": subject,
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Admin email sent: {subject}")
    except Exception as e:
        logger.error(f"Failed to send email '{subject}': {e}")

def signup_email_html(name: str, email: str):
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
        <h2 style="color:#0B3C5D;">New Student Signup!</h2>
        <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#666;">Name:</td><td style="padding:8px 0;font-weight:bold;">{name}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Email:</td><td style="padding:8px 0;font-weight:bold;">{email}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Time:</td><td style="padding:8px 0;">{datetime.utcnow().strftime('%d %b %Y, %I:%M %p')} UTC</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:20px;">— Crack CUET Platform</p>
    </div>"""

def subscription_email_html(name: str, email: str, plan: str, amount: str):
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
        <h2 style="color:#0B3C5D;">New Subscription Payment!</h2>
        <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#666;">Student:</td><td style="padding:8px 0;font-weight:bold;">{name}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Email:</td><td style="padding:8px 0;font-weight:bold;">{email}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Plan:</td><td style="padding:8px 0;font-weight:bold;color:#10b981;">{plan}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Amount:</td><td style="padding:8px 0;font-weight:bold;">{amount}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Valid Until:</td><td style="padding:8px 0;">{(datetime.utcnow() + timedelta(days=30)).strftime('%d %b %Y')}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:20px;">— Crack CUET Platform</p>
    </div>"""

# CUET Subjects Configuration
CUET_SUBJECTS = {
    "domain": [
        {"name": "Physics", "code": "PHY"},
        {"name": "Chemistry", "code": "CHE"},
        {"name": "Mathematics", "code": "MAT"},
        {"name": "Biology", "code": "BIO"},
        {"name": "Economics", "code": "ECO"},
        {"name": "Business Studies", "code": "BST"},
        {"name": "Accountancy", "code": "ACC"},
        {"name": "History", "code": "HIS"},
        {"name": "Political Science", "code": "POL"},
        {"name": "Geography", "code": "GEO"},
        {"name": "Computer Science", "code": "CSC"},
        {"name": "Psychology", "code": "PSY"},
        {"name": "Sociology", "code": "SOC"},
        {"name": "Applied Mathematics", "code": "APM"}
    ],
    "language": [
        {"name": "English", "code": "ENG"},
        {"name": "Hindi", "code": "HIN"}
    ],
    "general": [
        {"name": "General Aptitude Test", "code": "GAT"}
    ]
}

# Plan limits
# FREE: 1 free mock per subject (lifetime)
# PRO: 8 mocks per subject per month (₹999/month)
# PREMIUM: 10 mocks per subject per month (₹1499/month)
PRO_MOCKS_PER_SUBJECT_MONTH = 8
PREMIUM_MOCKS_PER_SUBJECT_MONTH = 10
FREE_MOCKS_PER_SUBJECT = 1  # lifetime limit

# ==================== Helper Functions ====================

# ==================== AI Mock Generation Background Task ====================

async def _generate_and_pin_mock_questions(mock_id: str):
    """Background job: generate full 50-question set for a mock and pin question_ids."""
    mock_data = await db.mock_tests.find_one({"id": mock_id}, {"_id": 0})
    if not mock_data:
        return

    mock = MockTest(**mock_data)

    # If already ready and sufficiently unique, skip regeneration
    if mock.question_ids and len(mock.question_ids) >= mock.total_questions:
        qs = await db.questions.find(
            {"id": {"$in": mock.question_ids}},
            {"_id": 0, "id": 1, "question_text": 1}
        ).to_list(5000)
        qmap = {q["id"]: q for q in qs}

        def _norm(t: str) -> str:
            import re
            return re.sub(r"\s+", " ", re.sub(r"[^a-zA-Z0-9]+", " ", (t or "").lower())).strip()

        norms = [_norm(qmap.get(qid, {}).get("question_text", "")) for qid in mock.question_ids]
        if len(set(norms)) >= int(0.9 * mock.total_questions):
            await db.mock_tests.update_one(
                {"id": mock_id},
                {"$set": {
                    "question_generation_status": "ready",
                    "question_generation_completed_at": datetime.utcnow(),
                    "question_generation_error": None
                }}
            )
            return

    # Mark in progress
    await db.mock_tests.update_one(
        {"id": mock_id},
        {"$set": {"question_generation_status": "in_progress", "question_generation_started_at": datetime.utcnow()}}
    )

    try:
        generator = QuestionGenerator()
        ai_questions = await generator.generate_mock_test_questions(
            subject=mock.subject,
            total_questions=mock.total_questions
        )

        question_ids: List[str] = []
        seen = set()

        for q in ai_questions:
            existing = await db.questions.find_one(
                {"question_text": q.question_text, "subject": mock.subject},
                {"_id": 0}
            )
            qid = existing["id"] if existing else q.id
            if qid in seen:
                continue
            if not existing:
                await db.questions.insert_one(q.dict())
            question_ids.append(qid)
            seen.add(qid)
            if len(question_ids) >= mock.total_questions:
                break


        # Enforce pinned-set uniqueness by normalized text
        if len(question_ids) >= mock.total_questions:
            qs = await db.questions.find({"id": {"$in": question_ids}}, {"_id": 0, "id": 1, "question_text": 1}).to_list(5000)
            qmap = {q["id"]: q for q in qs}
            def _norm(t: str) -> str:
                import re
                return re.sub(r"\s+", " ", re.sub(r"[^a-zA-Z0-9]+", " ", (t or "").lower())).strip()
            seen_norm = set()
            uniq_ids = []
            for qid in question_ids:
                qt = qmap.get(qid, {}).get("question_text", "")
                n = _norm(qt)
                if n in seen_norm:
                    continue
                seen_norm.add(n)
                uniq_ids.append(qid)
            question_ids = uniq_ids

        if len(question_ids) < mock.total_questions:
            raise Exception(f"Insufficient questions generated ({len(question_ids)}/{mock.total_questions})")

        await db.mock_tests.update_one(
            {"id": mock_id},
            {"$set": {
                "question_ids": question_ids[:mock.total_questions],
                "question_generation_status": "ready",
                "question_generation_completed_at": datetime.utcnow(),
                "question_generation_error": None
            }}
        )

    except Exception as e:
        logger.error(f"Background AI generation failed for mock={mock_id}: {e}")
        await db.mock_tests.update_one(
            {"id": mock_id},
            {"$set": {
                "question_generation_status": "failed",
                "question_generation_completed_at": datetime.utcnow(),
                "question_generation_error": str(e)
            }}
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[User]:
    """Get current authenticated user from token."""
    if not credentials:
        return None
    
    user_id = get_current_user_id(credentials.credentials)
    if not user_id:
        return None
    
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        return None
    
    user = User(**user_data)
    
    # Check subscription expiry
    if user.plan in (PlanType.PRO, PlanType.PREMIUM) and user.subscription_end:
        if datetime.utcnow() > user.subscription_end:
            # Subscription expired → revert to free
            await db.users.update_one(
                {"id": user.id},
                {"$set": {
                    "plan": PlanType.FREE.value,
                    "subscription_start": None,
                    "subscription_end": None,
                    "mocks_taken_this_month": 0,
                    "updated_at": datetime.utcnow()
                }}
            )
            user.plan = PlanType.FREE
            user.subscription_start = None
            user.subscription_end = None
            logging.info(f"Subscription expired for user {user.email}, reverted to free plan")
    
    return user

async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Require authentication."""
    user = await get_current_user(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

# ==================== Auth Endpoints ====================

@api_router.post("/auth/register", response_model=APIResponse)
async def register_user(user_data: UserCreate, background_tasks: BackgroundTasks):
    """Register a new user."""
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hash_password(user_data.password),
        plan=PlanType.FREE,
        preferences=UserPreferences()
    )
    
    await db.users.insert_one(user.dict())
    
    # Send admin notification email (non-blocking)
    background_tasks.add_task(
        send_admin_email,
        f"New Signup: {user.name}",
        signup_email_html(user.name, user.email)
    )
    
    # Generate access token
    token = create_access_token({"user_id": user.id, "email": user.email})
    
    return APIResponse(
        success=True,
        message="Registration successful",
        data={
            "token": token,
            "user": UserResponse(**user.dict()).dict()
        }
    )

@api_router.post("/auth/login", response_model=APIResponse)
async def login_user(login_data: UserLogin):
    """Login a user."""
    user_data = await db.users.find_one({"email": login_data.email})
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(**user_data)
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last active date
    today = datetime.utcnow().strftime("%Y-%m-%d")
    if user.last_active_date != today:
        # Check streak
        if user.last_active_date:
            yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
            if user.last_active_date == yesterday:
                user.streak_days += 1
            else:
                user.streak_days = 1
        else:
            user.streak_days = 1
        
        user.last_active_date = today
        await db.users.update_one({"id": user.id}, {"$set": {"last_active_date": today, "streak_days": user.streak_days}})
    
    # Generate access token
    token = create_access_token({"user_id": user.id, "email": user.email})
    
    return APIResponse(
        success=True,
        message="Login successful",
        data={
            "token": token,
            "user": UserResponse(**user.dict()).dict()
        }
    )

@api_router.get("/auth/me", response_model=APIResponse)
async def get_current_user_info(user: User = Depends(require_auth)):
    """Get current user information."""
    return APIResponse(
        success=True,
        message="User information retrieved",
        data=UserResponse(**user.dict()).dict()
    )

# ==================== Onboarding Endpoints ====================

@api_router.get("/subjects", response_model=APIResponse)
async def get_available_subjects():
    """Get all available CUET subjects for onboarding."""
    return APIResponse(
        success=True,
        message="Subjects retrieved",
        data=CUET_SUBJECTS
    )

@api_router.post("/onboarding", response_model=APIResponse)
async def complete_onboarding(request: OnboardingRequest, user: User = Depends(require_auth)):
    """Complete user onboarding with subject preferences."""
    if len(request.domain_subjects) != 3:
        raise HTTPException(status_code=400, detail="Please select exactly 3 domain subjects")
    
    if request.language not in ["English", "Hindi"]:
        raise HTTPException(status_code=400, detail="Please select a valid language")
    
    # Update user preferences
    preferences = UserPreferences(
        domain_subjects=request.domain_subjects,
        language=request.language,
        onboarding_completed=True
    )
    
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"preferences": preferences.dict(), "updated_at": datetime.utcnow()}}
    )
    
    return APIResponse(
        success=True,
        message="Onboarding completed successfully",
        data=preferences.dict()
    )

# ==================== Mock Test Endpoints ====================

@api_router.get("/mocks", response_model=APIResponse)
async def get_available_mocks(user: User = Depends(require_auth)):
    """Get available mock tests based on user's selected subjects."""
    if not user.preferences.onboarding_completed:
        raise HTTPException(status_code=400, detail="Please complete onboarding first")
    
    # Get ALL active mocks from all subjects
    all_mocks = await db.mock_tests.find({"is_active": True}).to_list(500)
    
    mocks = []
    for mock_data in all_mocks:
        # Get user's attempts for this mock
        attempts = await db.test_attempts.find({
            "user_id": user.id,
            "mock_test_id": mock_data["id"]
        }).to_list(100)
        
        # Calculate best scores safely (handle None values)
        scores = [a.get("score", 0) or 0 for a in attempts]
        percentiles = [a.get("percentile", 0) or 0 for a in attempts]
        
        mocks.append({
            **MockTestResponse(**mock_data).dict(),
            "attempts_count": len(attempts),
            "best_score": max(scores) if scores else None,
            "best_percentile": max(percentiles) if percentiles else None
        })
    
    # Calculate plan-based availability for each subject
    can_take_mock = True
    plan_info = {
        "plan": user.plan,
        "is_free": user.plan == PlanType.FREE,
        "free_mocks_used": user.free_mocks_used or {},
    }
    
    # For free users, check each subject's free mock status
    if user.plan == PlanType.FREE:
        # User can take mock if they haven't used their 1 free mock for that subject
        pass  # We'll check per-subject in the frontend
    
    return APIResponse(
        success=True,
        message="Mocks retrieved",
        data={
            "mocks": mocks,
            "can_take_mock": can_take_mock,
            "plan_info": plan_info,
            "plan": user.plan
        }
    )

@api_router.post("/mocks/start", response_model=APIResponse)
async def start_mock_test(
    request: TestAttemptCreate,
    response: Response,
    background_tasks: BackgroundTasks,
    user: User = Depends(require_auth),
):
    """Start a new mock test attempt."""
    # Get mock test first to check subject
    mock_data = await db.mock_tests.find_one({"id": request.mock_test_id}, {"_id": 0})
    if not mock_data:
        raise HTTPException(status_code=404, detail="Mock test not found")
    
    subject = mock_data.get("subject", "")
    
    # Check plan limits
    if user.plan == PlanType.FREE:
        # Free users: 1 mock per subject (lifetime)
        free_used = user.free_mocks_used.get(subject, 0) if user.free_mocks_used else 0
        if free_used >= FREE_MOCKS_PER_SUBJECT:
            raise HTTPException(
                status_code=403,
                detail=f"You've used your free mock for {subject}. Upgrade to Pro for unlimited mocks."
            )
    elif user.plan == PlanType.PRO:
        # Pro users: 8 mocks per subject per month
        # For now, check total monthly - can be enhanced to per-subject tracking
        if user.mocks_taken_this_month >= PRO_MOCKS_PER_SUBJECT_MONTH * 5:  # rough estimate
            raise HTTPException(
                status_code=403,
                detail="Monthly mock limit reached. Upgrade to Premium for more mocks."
            )
    # PREMIUM users have generous limits

    # If generation is in progress for this mock, return 202 quickly
    if mock_data.get("question_generation_status") == "in_progress" and not mock_data.get("question_ids"):
        response.status_code = 202
        return APIResponse(
            success=True,
            message="Generating your AI mock. Please retry in a few seconds.",
            data={
                "status": "generating",
                "mock_test": MockTestResponse(**mock_data).dict(),
            },
        )
    
    mock = MockTest(**mock_data)
    
    # Reuse the SAME 50 questions per mock (shared across all users)
    selected_questions: List[Dict[str, Any]] = []

    if mock.question_ids and len(mock.question_ids) >= mock.total_questions:
        existing_questions = await db.questions.find(
            {"id": {"$in": mock.question_ids}},
            {"_id": 0, "id": 1, "question_text": 1, "options": 1, "marks": 1, "negative_marks": 1, "diagram_ascii": 1, "passage": 1}
        ).to_list(5000)
        q_map = {q["id"]: q for q in existing_questions}
        selected_questions = [q_map[qid] for qid in mock.question_ids if qid in q_map][:mock.total_questions]

        # If pinned set is too repetitive, trigger regeneration
        def _norm(t: str) -> str:
            import re
            return re.sub(r"\s+", " ", re.sub(r"[^a-zA-Z0-9]+", " ", (t or "").lower())).strip()

        norms = [_norm(q.get("question_text")) for q in selected_questions]
        if len(set(norms)) < int(0.9 * mock.total_questions):
            await db.mock_tests.update_one(
                {"id": mock.id},
                {"$set": {"question_ids": [], "question_generation_status": "not_started", "question_generation_error": None}}
            )
            selected_questions = []

    # If not already set up, trigger background AI generation and return 202
    if len(selected_questions) < mock.total_questions:
        if mock.question_generation_status in ["not_started", "failed"]:
            await db.mock_tests.update_one(
                {"id": mock.id},
                {"$set": {"question_generation_status": "in_progress", "question_generation_started_at": datetime.utcnow()}}
            )
            background_tasks.add_task(_generate_and_pin_mock_questions, mock.id)

        response.status_code = 202
        return APIResponse(
            success=True,
            message="Generating your AI mock. Please retry in a few seconds.",
            data={
                "status": "generating",
                "mock_test": MockTestResponse(**mock.dict()).dict(),
            },
        )
    
    # Create test attempt
    attempt = TestAttempt(
        user_id=user.id,
        mock_test_id=mock.id,
        subject=mock.subject,
        status=TestStatus.IN_PROGRESS,
        question_attempts=[
            QuestionAttempt(question_id=q["id"]) for q in selected_questions
        ],
        time_remaining_seconds=mock.duration_minutes * 60,
        unattempted_count=len(selected_questions),
        started_at=datetime.utcnow()
    )
    
    await db.test_attempts.insert_one(attempt.dict())
    
    # Increment mock count and track free mock usage
    update_ops = {"$inc": {"mocks_taken_this_month": 1, "total_mocks_taken": 1}}
    
    # For FREE plan users, also track free mock usage per subject
    if user.plan == PlanType.FREE:
        update_ops["$inc"][f"free_mocks_used.{mock.subject}"] = 1
    
    await db.users.update_one({"id": user.id}, update_ops)
    
    # Prepare questions for response (without correct answers)
    questions_for_response = []
    for q in selected_questions:
        questions_for_response.append({
            "id": q["id"],
            "question_text": q["question_text"],
            "diagram_ascii": q.get("diagram_ascii"),
            "passage": q.get("passage"),  # Include passage for English comprehension questions
            "options": [{"id": opt["id"], "text": opt["text"]} for opt in q["options"]],
            "marks": q.get("marks", 5),
            "negative_marks": q.get("negative_marks", 1)
        })
    
    return APIResponse(
        success=True,
        message="Mock test started",
        data={
            "attempt_id": attempt.id,
            "mock_test": MockTestResponse(**mock.dict()).dict(),
            "questions": questions_for_response,
            "time_remaining_seconds": attempt.time_remaining_seconds
        }
    )

@api_router.post("/mocks/save-answer", response_model=APIResponse)
async def save_answer(answer: AnswerSubmission, attempt_id: str, user: User = Depends(require_auth)):
    """Save an answer during the test (auto-save)."""
    attempt_data = await db.test_attempts.find_one({"id": attempt_id, "user_id": user.id})
    if not attempt_data:
        raise HTTPException(status_code=404, detail="Test attempt not found")
    
    if attempt_data["status"] != TestStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Test is not in progress")
    
    # Update the specific question attempt
    await db.test_attempts.update_one(
        {"id": attempt_id, "question_attempts.question_id": answer.question_id},
        {
            "$set": {
                "question_attempts.$.selected_option_id": answer.selected_option_id,
                "question_attempts.$.time_spent_seconds": answer.time_spent_seconds
            }
        }
    )
    
    return APIResponse(success=True, message="Answer saved")

@api_router.post("/mocks/submit", response_model=APIResponse)
async def submit_mock_test(submission: TestSubmission, user: User = Depends(require_auth)):
    """Submit a completed mock test."""
    attempt_data = await db.test_attempts.find_one({"id": submission.attempt_id, "user_id": user.id})
    if not attempt_data:
        raise HTTPException(status_code=404, detail="Test attempt not found")
    
    if attempt_data["status"] == TestStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Test already submitted")
    
    attempt = TestAttempt(**attempt_data)
    
    # Process answers and calculate score
    correct_count = 0
    incorrect_count = 0
    unattempted_count = 0
    score = 0
    topic_stats = {}
    
    for answer in submission.answers:
        # Update attempt with answer
        for qa in attempt.question_attempts:
            if qa.question_id == answer.question_id:
                qa.selected_option_id = answer.selected_option_id
                qa.time_spent_seconds = answer.time_spent_seconds
                break
    
    # Calculate score
    for qa in attempt.question_attempts:
        # Get question details
        question_data = await db.questions.find_one({"id": qa.question_id})
        if not question_data:
            continue
        
        question = Question(**question_data)
        topic = question.topic
        
        if topic not in topic_stats:
            topic_stats[topic] = {
                "total": 0, "correct": 0, "incorrect": 0,
                "unattempted": 0, "total_time": 0
            }
        
        topic_stats[topic]["total"] += 1
        topic_stats[topic]["total_time"] += qa.time_spent_seconds
        
        if qa.selected_option_id is None:
            unattempted_count += 1
            topic_stats[topic]["unattempted"] += 1
            qa.is_correct = None
        elif qa.selected_option_id == question.correct_option_id:
            correct_count += 1
            score += question.marks
            topic_stats[topic]["correct"] += 1
            qa.is_correct = True
        else:
            incorrect_count += 1
            score -= question.negative_marks
            topic_stats[topic]["incorrect"] += 1
            qa.is_correct = False
    
    score = max(0, score)  # Ensure score doesn't go negative
    
    # Get or create leaderboard for this mock
    leaderboard_entries = await db.leaderboard.find({
        "mock_test_id": attempt.mock_test_id
    }).to_list(1000)
    
    if len(leaderboard_entries) < 50:
        # Generate synthetic entries
        synthetic_entries = generate_synthetic_leaderboard(
            attempt.subject, attempt.mock_test_id, 100
        )
        for entry in synthetic_entries:
            await db.leaderboard.insert_one(entry.dict())
        leaderboard_entries = await db.leaderboard.find({
            "mock_test_id": attempt.mock_test_id
        }).to_list(1000)
    
    # Calculate rank and percentile
    total_time = sum(qa.time_spent_seconds for qa in attempt.question_attempts)
    rank, percentile = calculate_rank_and_percentile(
        score, total_time, [LeaderboardEntry(**e) for e in leaderboard_entries]
    )
    
    # Update attempt
    attempt.status = TestStatus.COMPLETED
    attempt.score = score
    attempt.correct_count = correct_count
    attempt.incorrect_count = incorrect_count
    attempt.unattempted_count = unattempted_count
    attempt.total_time_spent_seconds = total_time
    attempt.rank = rank
    attempt.percentile = percentile
    attempt.completed_at = datetime.utcnow()
    
    await db.test_attempts.update_one(
        {"id": attempt.id},
        {"$set": attempt.dict()}
    )
    
    # Add to leaderboard
    leaderboard_entry = LeaderboardEntry(
        user_id=user.id,
        user_name=user.name,
        subject=attempt.subject,
        mock_test_id=attempt.mock_test_id,
        attempt_id=attempt.id,
        score=score,
        time_taken_seconds=total_time,
        rank=rank,
        percentile=percentile,
        is_synthetic=False
    )
    await db.leaderboard.insert_one(leaderboard_entry.dict())
    
    # Recalculate ranks for all entries
    all_entries = await db.leaderboard.find({"mock_test_id": attempt.mock_test_id}).to_list(1000)
    sorted_entries = sorted(all_entries, key=lambda x: (-x["score"], x["time_taken_seconds"]))
    
    for i, entry in enumerate(sorted_entries):
        new_rank = i + 1
        new_percentile = round(((len(sorted_entries) - new_rank) / len(sorted_entries)) * 100, 2)
        await db.leaderboard.update_one(
            {"id": entry["id"]},
            {"$set": {"rank": new_rank, "percentile": new_percentile}}
        )
    
    # Update user badges
    badges = assign_badges(score, percentile, user.streak_days)
    if badges:
        await db.users.update_one(
            {"id": user.id},
            {"$addToSet": {"badges": {"$each": badges}}}
        )
    
    return APIResponse(
        success=True,
        message="Test submitted successfully",
        data={
            "attempt_id": attempt.id,
            "subject": attempt.subject,
            "score": score,
            "total_marks": 250,
            "rank": rank,
            "percentile": percentile,
            "correct_count": correct_count,
            "incorrect_count": incorrect_count,
            "unattempted_count": unattempted_count,
            "time_taken_seconds": total_time,
            "percentile_message": get_percentile_message(percentile),
            "badges_earned": badges
        }
    )

# ==================== Leaderboard Endpoints ====================

@api_router.get("/leaderboard/{subject}", response_model=APIResponse)
async def get_subject_leaderboard(subject: str, user: User = Depends(require_auth)):
    """Get leaderboard for a specific subject."""
    # Get all mock tests for this subject
    mock_tests = await db.mock_tests.find({"subject": subject}).to_list(100)
    
    if not mock_tests:
        return APIResponse(
            success=True,
            message="No leaderboard data yet",
            data={"top_performers": [], "user_stats": None, "nearby_ranks": []}
        )
    
    # Aggregate leaderboard across all mocks for the subject
    all_entries = []
    for mock in mock_tests:
        entries = await db.leaderboard.find({"mock_test_id": mock["id"]}).to_list(1000)
        all_entries.extend(entries)
    
    if not all_entries:
        return APIResponse(
            success=True,
            message="No leaderboard data yet",
            data={"top_performers": [], "user_stats": None, "nearby_ranks": []}
        )
    
    # Get best score per user
    user_best_scores = {}
    for entry in all_entries:
        uid = entry["user_id"]
        if uid not in user_best_scores or entry["score"] > user_best_scores[uid]["score"]:
            user_best_scores[uid] = entry
    
    # Sort by score
    sorted_entries = sorted(user_best_scores.values(), key=lambda x: (-x["score"], x["time_taken_seconds"]))
    
    # Assign ranks
    for i, entry in enumerate(sorted_entries):
        entry["rank"] = i + 1
        entry["percentile"] = round(((len(sorted_entries) - entry["rank"]) / len(sorted_entries)) * 100, 2)
    
    # Get top 10
    top_performers = []
    for entry in sorted_entries[:10]:
        top_performers.append(LeaderboardResponse(
            rank=entry["rank"],
            user_name=entry["user_name"],
            score=entry["score"],
            time_taken_seconds=entry["time_taken_seconds"],
            percentile=entry["percentile"],
            is_current_user=entry["user_id"] == user.id
        ).dict())
    
    # Get user's position
    user_entry = user_best_scores.get(user.id)
    user_stats = None
    nearby_ranks = []
    
    if user_entry:
        user_rank = next((e["rank"] for e in sorted_entries if e["user_id"] == user.id), None)
        if user_rank:
            user_stats = {
                "rank": user_rank,
                "score": user_entry["score"],
                "percentile": user_entry["percentile"],
                "attempts_count": await db.test_attempts.count_documents({
                    "user_id": user.id, "subject": subject, "status": TestStatus.COMPLETED
                })
            }
            
            # Get nearby ranks
            start = max(0, user_rank - 6)
            end = min(len(sorted_entries), user_rank + 5)
            for entry in sorted_entries[start:end]:
                nearby_ranks.append(LeaderboardResponse(
                    rank=entry["rank"],
                    user_name=entry["user_name"],
                    score=entry["score"],
                    time_taken_seconds=entry["time_taken_seconds"],
                    percentile=entry["percentile"],
                    is_current_user=entry["user_id"] == user.id
                ).dict())
    
    return APIResponse(
        success=True,
        message="Leaderboard retrieved",
        data={
            "subject": subject,
            "top_performers": top_performers,
            "user_stats": user_stats,
            "nearby_ranks": nearby_ranks,
            "total_participants": len(sorted_entries)
        }
    )


@api_router.get("/leaderboard/subjects/overview", response_model=APIResponse)
async def get_leaderboard_subjects_overview(user: User = Depends(require_auth)):
    """Get overview of all subjects for leaderboard selection screen."""
    
    # Get all subjects that have mock tests
    all_subjects = await db.mock_tests.distinct("subject")
    
    subject_stats = []
    
    for subject in all_subjects:
        # Get all mock tests for this subject
        mock_tests = await db.mock_tests.find({"subject": subject}).to_list(100)
        mock_ids = [m["id"] for m in mock_tests]
        
        # Get all leaderboard entries for this subject
        all_entries = await db.leaderboard.find({"mock_test_id": {"$in": mock_ids}}).to_list(10000)
        
        # Get best score per user
        user_best_scores = {}
        for entry in all_entries:
            uid = entry["user_id"]
            if uid not in user_best_scores or entry["score"] > user_best_scores[uid]["score"]:
                user_best_scores[uid] = entry
        
        total_participants = len(user_best_scores)
        
        # Calculate user's percentile in this subject
        user_percentile = None
        user_best_score = None
        user_rank = None
        
        if user.id in user_best_scores:
            user_entry = user_best_scores[user.id]
            user_best_score = user_entry["score"]
            
            # Sort all entries and find user's rank
            sorted_entries = sorted(user_best_scores.values(), key=lambda x: (-x["score"], x["time_taken_seconds"]))
            for i, entry in enumerate(sorted_entries):
                if entry["user_id"] == user.id:
                    user_rank = i + 1
                    user_percentile = round(((total_participants - user_rank) / total_participants) * 100, 1) if total_participants > 0 else 0
                    break
        
        # Generate motivational message
        if user_percentile is not None:
            if user_percentile >= 90:
                motivational_message = f"You're in Top {100 - user_percentile:.0f}%! 🔥"
            elif user_percentile >= 75:
                motivational_message = f"You're in Top {100 - user_percentile:.0f}%! Keep pushing!"
            elif user_percentile >= 50:
                motivational_message = f"You're ahead of {user_percentile:.0f}% students"
            else:
                motivational_message = "Room to improve - you've got this!"
        else:
            motivational_message = "Attempt a mock to unlock your rank"
        
        subject_stats.append({
            "subject": subject,
            "total_participants": total_participants,
            "user_percentile": user_percentile,
            "user_best_score": user_best_score,
            "user_rank": user_rank,
            "motivational_message": motivational_message,
            "has_attempted": user.id in user_best_scores
        })
    
    # Sort by total participants (most popular first)
    subject_stats.sort(key=lambda x: -x["total_participants"])
    
    return APIResponse(
        success=True,
        message="Subject overview retrieved",
        data={"subjects": subject_stats}
    )


@api_router.get("/leaderboard/{subject}/full", response_model=APIResponse)
async def get_full_subject_leaderboard(
    subject: str,
    time_filter: str = "all_time",  # all_time, this_month, this_week
    user: User = Depends(require_auth)
):
    """Get comprehensive leaderboard for a subject with all sections."""
    
    # Calculate date filter
    now = datetime.utcnow()
    date_filter = None
    if time_filter == "this_month":
        date_filter = now - timedelta(days=30)
    elif time_filter == "this_week":
        date_filter = now - timedelta(days=7)
    
    # Get all mock tests for this subject
    mock_tests = await db.mock_tests.find({"subject": subject}).to_list(100)
    mock_ids = [m["id"] for m in mock_tests]
    
    if not mock_tests:
        return APIResponse(
            success=True,
            message="No data for this subject",
            data={
                "subject": subject,
                "personal_stats": None,
                "top_three": [],
                "nearby_competitors": [],
                "full_leaderboard": [],
                "total_participants": 0,
                "time_filter": time_filter
            }
        )
    
    # Build query for leaderboard entries
    leaderboard_query = {"mock_test_id": {"$in": mock_ids}}
    
    # Get all leaderboard entries
    all_entries = await db.leaderboard.find(leaderboard_query).to_list(50000)
    
    # Apply time filter if needed
    if date_filter:
        all_entries = [e for e in all_entries if e.get("created_at", datetime.min) >= date_filter]
    
    # Get best score per user
    user_best_scores = {}
    user_best_times = {}
    for entry in all_entries:
        uid = entry["user_id"]
        score = entry["score"]
        time_taken = entry["time_taken_seconds"]
        
        if uid not in user_best_scores:
            user_best_scores[uid] = entry
            user_best_times[uid] = entry
        else:
            # Keep best score
            if score > user_best_scores[uid]["score"]:
                user_best_scores[uid] = entry
            elif score == user_best_scores[uid]["score"] and time_taken < user_best_scores[uid]["time_taken_seconds"]:
                user_best_scores[uid] = entry
            # Keep best time
            if time_taken < user_best_times[uid]["time_taken_seconds"]:
                user_best_times[uid] = entry
    
    # Sort by score (desc), then time (asc), then created_at (asc)
    sorted_entries = sorted(
        user_best_scores.values(),
        key=lambda x: (-x["score"], x["time_taken_seconds"], x.get("created_at", datetime.max))
    )
    
    total_participants = len(sorted_entries)
    
    # Assign ranks and percentiles
    for i, entry in enumerate(sorted_entries):
        entry["rank"] = i + 1
        entry["percentile"] = round(((total_participants - entry["rank"]) / total_participants) * 100, 2) if total_participants > 0 else 0
    
    # === SECTION A: Personal Stats ===
    personal_stats = None
    user_rank = None
    
    if user.id in user_best_scores:
        user_entry = user_best_scores[user.id]
        user_rank = next((e["rank"] for e in sorted_entries if e["user_id"] == user.id), None)
        
        # Get user's previous best to calculate rank delta (for future use)
        _ = await db.test_attempts.find({
            "user_id": user.id,
            "subject": subject,
            "status": TestStatus.COMPLETED
        }).sort("completed_at", -1).to_list(10)
        
        rank_delta = None
        rank_direction = "same"
        
        # Calculate marks needed for improvement
        marks_to_next_rank = None
        next_rank_target = None
        marks_to_top_50 = None
        marks_to_top_20_percent = None
        
        if user_rank and user_rank > 1:
            # Find the entry just above user
            for entry in sorted_entries:
                if entry["rank"] == user_rank - 1:
                    marks_to_next_rank = entry["score"] - user_entry["score"] + 1
                    next_rank_target = entry["rank"]
                    break
        
        # Calculate marks to reach top 50
        if user_rank and user_rank > 50 and len(sorted_entries) >= 50:
            rank_50_entry = sorted_entries[49]
            marks_to_top_50 = rank_50_entry["score"] - user_entry["score"] + 1
        
        # Calculate marks to reach top 20%
        top_20_percent_rank = max(1, int(total_participants * 0.2))
        if user_rank and user_rank > top_20_percent_rank and len(sorted_entries) >= top_20_percent_rank:
            top_20_entry = sorted_entries[top_20_percent_rank - 1]
            marks_to_top_20_percent = top_20_entry["score"] - user_entry["score"] + 1
        
        # Generate motivational message
        if user_rank == 1:
            motivational_message = "🏆 You're #1! Incredible performance!"
        elif user_rank <= 3:
            motivational_message = f"🥇 You're on the podium! Just {marks_to_next_rank or 1} marks to climb higher!"
        elif user_rank <= 10:
            motivational_message = f"⭐ Top 10! {marks_to_next_rank or 1} marks to reach Rank {next_rank_target or user_rank - 1}"
        elif marks_to_top_50 and marks_to_top_50 > 0:
            motivational_message = f"📈 {marks_to_top_50} marks away from Top 50"
        elif marks_to_top_20_percent and marks_to_top_20_percent > 0:
            motivational_message = f"💪 {marks_to_top_20_percent} marks to enter Top 20%"
        elif marks_to_next_rank:
            motivational_message = f"🎯 {marks_to_next_rank} marks to reach Rank {next_rank_target}"
        else:
            motivational_message = f"🔥 You're in Top {100 - user_entry['percentile']:.0f}%! Keep improving!"
        
        personal_stats = {
            "rank": user_rank,
            "total_participants": total_participants,
            "percentile": user_entry["percentile"],
            "best_score": user_entry["score"],
            "best_time_seconds": user_entry["time_taken_seconds"],
            "rank_delta": rank_delta,
            "rank_direction": rank_direction,
            "motivational_message": motivational_message,
            "marks_to_next_rank": marks_to_next_rank,
            "next_rank_target": next_rank_target,
            "has_attempted": True
        }
    else:
        personal_stats = {
            "rank": None,
            "total_participants": total_participants,
            "percentile": None,
            "best_score": None,
            "best_time_seconds": None,
            "rank_delta": None,
            "rank_direction": None,
            "motivational_message": "You haven't attempted this subject yet.",
            "marks_to_next_rank": None,
            "next_rank_target": None,
            "has_attempted": False
        }
    
    # === SECTION C: Top 3 Podium ===
    top_three = []
    for entry in sorted_entries[:3]:
        top_three.append({
            "rank": entry["rank"],
            "user_id": entry["user_id"],
            "user_name": entry["user_name"],
            "score": entry["score"],
            "percentile": entry["percentile"],
            "time_taken_seconds": entry["time_taken_seconds"],
            "is_current_user": entry["user_id"] == user.id,
            "is_synthetic": entry.get("is_synthetic", False)
        })
    
    # === SECTION D: Nearby Competitors ===
    nearby_competitors = []
    if user_rank:
        # Get 2 above and 2 below
        start_idx = max(0, user_rank - 3)
        end_idx = min(len(sorted_entries), user_rank + 2)
        
        for entry in sorted_entries[start_idx:end_idx]:
            nearby_competitors.append({
                "rank": entry["rank"],
                "user_id": entry["user_id"],
                "user_name": entry["user_name"],
                "score": entry["score"],
                "percentile": entry["percentile"],
                "time_taken_seconds": entry["time_taken_seconds"],
                "is_current_user": entry["user_id"] == user.id,
                "is_synthetic": entry.get("is_synthetic", False)
            })
    
    # === SECTION E: Full Leaderboard (paginated, top 100) ===
    full_leaderboard = []
    for entry in sorted_entries[:100]:
        full_leaderboard.append({
            "rank": entry["rank"],
            "user_id": entry["user_id"],
            "user_name": entry["user_name"],
            "score": entry["score"],
            "percentile": entry["percentile"],
            "time_taken_seconds": entry["time_taken_seconds"],
            "is_current_user": entry["user_id"] == user.id,
            "is_synthetic": entry.get("is_synthetic", False)
        })
    
    return APIResponse(
        success=True,
        message="Full leaderboard retrieved",
        data={
            "subject": subject,
            "personal_stats": personal_stats,
            "top_three": top_three,
            "nearby_competitors": nearby_competitors,
            "full_leaderboard": full_leaderboard,
            "total_participants": total_participants,
            "time_filter": time_filter,
            "ranking_explanation": {
                "title": "How ranking works",
                "description": "Ranking is based on your BEST score in this subject. Percentile is calculated by comparing your score with all students who have attempted this subject. Higher score = Higher rank. If scores are equal, lower time taken ranks higher."
            }
        }
    )


@api_router.get("/leaderboard/user/{user_id}/profile", response_model=APIResponse)
async def get_user_leaderboard_profile(user_id: str, current_user: User = Depends(require_auth)):
    """Get public profile for a user from leaderboard."""
    
    # Get user info
    target_user = await db.users.find_one({"id": user_id}, {"_id": 0, "hashed_password": 0})
    
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all completed attempts for this user
    attempts = await db.test_attempts.find({
        "user_id": user_id,
        "status": TestStatus.COMPLETED
    }).sort("completed_at", -1).to_list(100)
    
    # Get subject-wise stats
    subject_stats = {}
    for attempt in attempts:
        subject = attempt.get("subject")
        if subject not in subject_stats:
            subject_stats[subject] = {
                "best_score": 0,
                "attempts_count": 0,
                "total_score": 0,
                "scores_history": []
            }
        
        score = attempt.get("score", 0)
        subject_stats[subject]["attempts_count"] += 1
        subject_stats[subject]["total_score"] += score
        subject_stats[subject]["scores_history"].append({
            "score": score,
            "date": attempt.get("completed_at", datetime.utcnow()).isoformat()
        })
        
        if score > subject_stats[subject]["best_score"]:
            subject_stats[subject]["best_score"] = score
    
    # Calculate averages
    for subject in subject_stats:
        stats = subject_stats[subject]
        stats["average_score"] = round(stats["total_score"] / stats["attempts_count"], 1) if stats["attempts_count"] > 0 else 0
        # Keep only last 10 scores for graph
        stats["scores_history"] = stats["scores_history"][-10:]
    
    return APIResponse(
        success=True,
        message="User profile retrieved",
        data={
            "user_id": user_id,
            "user_name": target_user.get("name", "Unknown"),
            "total_mocks_taken": target_user.get("total_mocks_taken", 0),
            "subject_stats": subject_stats,
            "is_own_profile": user_id == current_user.id
        }
    )


# ==================== Analytics Endpoints ====================

@api_router.get("/analytics/attempt/{attempt_id}", response_model=APIResponse)
async def get_attempt_analytics(attempt_id: str, user: User = Depends(require_auth)):
    """Get detailed analytics for a specific test attempt."""
    attempt_data = await db.test_attempts.find_one({"id": attempt_id, "user_id": user.id})
    if not attempt_data:
        raise HTTPException(status_code=404, detail="Test attempt not found")
    
    if attempt_data["status"] != TestStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Test not yet completed")
    
    attempt = TestAttempt(**attempt_data)
    
    # Calculate topic-wise breakdown
    topic_stats = {}
    for qa in attempt.question_attempts:
        question_data = await db.questions.find_one({"id": qa.question_id})
        if not question_data:
            continue
        
        topic = question_data.get("topic", "Unknown")
        if topic not in topic_stats:
            topic_stats[topic] = {
                "total": 0, "correct": 0, "incorrect": 0,
                "unattempted": 0, "total_time": 0
            }
        
        topic_stats[topic]["total"] += 1
        topic_stats[topic]["total_time"] += qa.time_spent_seconds
        
        if qa.is_correct is True:
            topic_stats[topic]["correct"] += 1
        elif qa.is_correct is False:
            topic_stats[topic]["incorrect"] += 1
        else:
            topic_stats[topic]["unattempted"] += 1
    
    # Build topic analytics
    topic_breakdown = []
    strengths = []
    weaknesses = []
    
    for topic, stats in topic_stats.items():
        accuracy = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0
        avg_time = stats["total_time"] / stats["total"] if stats["total"] > 0 else 0
        
        topic_breakdown.append(TopicAnalytics(
            topic=topic,
            total_questions=stats["total"],
            correct=stats["correct"],
            incorrect=stats["incorrect"],
            unattempted=stats["unattempted"],
            accuracy=round(accuracy, 2),
            avg_time_seconds=round(avg_time, 2)
        ).dict())
        
        if accuracy >= 70:
            strengths.append(topic)
        elif accuracy < 50:
            weaknesses.append(topic)
    
    analytics = TestAnalytics(
        attempt_id=attempt.id,
        score=attempt.score,
        total_marks=250,
        rank=attempt.rank or 0,
        percentile=attempt.percentile or 0,
        correct_count=attempt.correct_count,
        incorrect_count=attempt.incorrect_count,
        unattempted_count=attempt.unattempted_count,
        total_time_seconds=attempt.total_time_spent_seconds,
        avg_time_per_question=round(attempt.total_time_spent_seconds / len(attempt.question_attempts), 2) if attempt.question_attempts else 0,
        topic_breakdown=topic_breakdown,
        strengths=strengths,
        weaknesses=weaknesses
    )
    
    analytics_data = analytics.dict()
    analytics_data["subject"] = attempt.subject

    return APIResponse(
        success=True,
        message="Analytics retrieved",
        data=analytics_data
    )

@api_router.get("/analytics/solutions/{attempt_id}", response_model=APIResponse)
async def get_attempt_solutions(attempt_id: str, user: User = Depends(require_auth)):
    """Get solutions for a completed test attempt."""
    attempt_data = await db.test_attempts.find_one({"id": attempt_id, "user_id": user.id})
    if not attempt_data:
        raise HTTPException(status_code=404, detail="Test attempt not found")
    
    if attempt_data["status"] != TestStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Solutions available only after test completion")
    
    attempt = TestAttempt(**attempt_data)
    
    solutions = []
    for qa in attempt.question_attempts:
        question_data = await db.questions.find_one({"id": qa.question_id})
        if not question_data:
            continue
        
        question = Question(**question_data)
        
        solutions.append({
            "question_id": question.id,
            "question_text": question.question_text,
            "diagram_ascii": getattr(question, "diagram_ascii", None),
            "options": [{"id": opt.id, "text": opt.text, "is_correct": opt.is_correct} for opt in question.options],
            "correct_option_id": question.correct_option_id,
            "selected_option_id": qa.selected_option_id,
            "is_correct": qa.is_correct,
            "explanation": question.explanation,
            "topic": question.topic,
            "chapter": question.chapter,
            "difficulty": question.difficulty
        })
    
    return APIResponse(
        success=True,
        message="Solutions retrieved",
        data={"attempt_id": attempt_id, "solutions": solutions}
    )

# ==================== Dashboard Endpoints ====================

@api_router.get("/dashboard", response_model=APIResponse)
async def get_dashboard(user: User = Depends(require_auth)):
    """Get user dashboard data."""
    # Get recent attempts
    recent_attempts = await db.test_attempts.find({
        "user_id": user.id,
        "status": TestStatus.COMPLETED
    }).sort("completed_at", -1).limit(5).to_list(5)
    
    # Get subject-wise performance
    subject_performance = {}
    all_attempts = await db.test_attempts.find({
        "user_id": user.id,
        "status": TestStatus.COMPLETED
    }).to_list(100)
    
    for attempt in all_attempts:
        subject = attempt["subject"]
        if subject not in subject_performance:
            subject_performance[subject] = {
                "attempts": 0,
                "total_score": 0,
                "best_score": 0,
                "best_percentile": 0
            }
        
        subject_performance[subject]["attempts"] += 1
        subject_performance[subject]["total_score"] += attempt.get("score", 0)
        subject_performance[subject]["best_score"] = max(
            subject_performance[subject]["best_score"],
            attempt.get("score", 0)
        )
        subject_performance[subject]["best_percentile"] = max(
            subject_performance[subject]["best_percentile"],
            attempt.get("percentile", 0)
        )
    
    # Calculate averages
    for subject, stats in subject_performance.items():
        stats["avg_score"] = round(stats["total_score"] / stats["attempts"], 2) if stats["attempts"] > 0 else 0
    
    # Plan info for dashboard
    plan_info = {
        "plan": user.plan,
        "is_free": user.plan == PlanType.FREE,
        "free_mocks_used": user.free_mocks_used or {}
    }
    
    return APIResponse(
        success=True,
        message="Dashboard data retrieved",
        data={
            "user": UserResponse(**user.dict()).dict(),
            "plan_info": plan_info,
            "recent_attempts": [
                {
                    "id": a["id"],
                    "subject": a["subject"],
                    "score": a.get("score", 0),
                    "rank": a.get("rank"),
                    "percentile": a.get("percentile"),
                    "completed_at": a.get("completed_at")
                }
                for a in recent_attempts
            ],
            "subject_performance": subject_performance,
            "streak_days": user.streak_days,
            "badges": user.badges
        }
    )

# ==================== Upgrade/Plan Endpoints ====================

class UserProfileUpdate(PydanticBaseModel):
    """Request model for capturing additional user data"""
    whatsapp: Optional[str] = None
    target_degree: Optional[str] = None
    target_cuet_score: Optional[int] = None
    dream_schools: Optional[List[str]] = None

@api_router.post("/user/capture-details", response_model=APIResponse)
async def capture_user_details(profile_data: UserProfileUpdate, user: User = Depends(require_auth)):
    """Capture additional user details for conversion tracking."""
    update_fields = {"updated_at": datetime.utcnow()}
    
    if profile_data.whatsapp:
        update_fields["profile.whatsapp"] = profile_data.whatsapp
    if profile_data.target_degree:
        update_fields["profile.target_degree"] = profile_data.target_degree
    if profile_data.target_cuet_score is not None:
        update_fields["profile.target_cuet_score"] = profile_data.target_cuet_score
    if profile_data.dream_schools:
        update_fields["profile.dream_schools"] = profile_data.dream_schools
    
    await db.users.update_one(
        {"id": user.id},
        {"$set": update_fields}
    )
    
    return APIResponse(
        success=True,
        message="Profile updated successfully",
        data={"updated_fields": list(update_fields.keys())}
    )

@api_router.get("/pricing/plans", response_model=APIResponse)
async def get_pricing_plans():
    """Get available pricing plans."""
    plans = [
        {
            "id": "free",
            "name": "Free",
            "price": 0,
            "price_display": "₹0",
            "period": "forever",
            "features": [
                "1 free mock per subject (lifetime)",
                "Basic performance analytics",
                "Limited leaderboard view",
                "Email support"
            ],
            "limits": {
                "mocks_per_subject": 1,
                "type": "lifetime"
            }
        },
        {
            "id": "pro",
            "name": "Pro",
            "price": 999,
            "price_display": "₹999",
            "period": "/month",
            "features": [
                "8 mocks per subject/month",
                "Full leaderboard access",
                "Weak-topic breakdown",
                "AI-powered feedback",
                "Priority support"
            ],
            "limits": {
                "mocks_per_subject": 8,
                "type": "monthly"
            },
            "popular": True
        },
        {
            "id": "premium",
            "name": "Premium",
            "price": 1499,
            "price_display": "₹1499",
            "period": "/month",
            "features": [
                "10 mocks per subject/month",
                "Everything in Pro",
                "Rank prediction",
                "Performance comparison",
                "Detailed performance reports",
                "Exclusive study materials"
            ],
            "limits": {
                "mocks_per_subject": 10,
                "type": "monthly"
            }
        }
    ]
    
    return APIResponse(
        success=True,
        message="Pricing plans retrieved",
        data={"plans": plans}
    )

@api_router.post("/upgrade-plan", response_model=APIResponse)
async def upgrade_plan(plan_data: dict = None, background_tasks: BackgroundTasks = None, user: User = Depends(require_auth)):
    """Activate a subscription plan with 30-day validity."""
    # Determine target plan from request body or default to pro
    target_plan = "pro"
    if plan_data and isinstance(plan_data, dict):
        target_plan = plan_data.get("plan", "pro")
    
    if target_plan not in ("pro", "premium"):
        raise HTTPException(status_code=400, detail="Invalid plan. Choose 'pro' or 'premium'")
    
    plan_enum = PlanType.PRO if target_plan == "pro" else PlanType.PREMIUM
    amount = "Rs.999" if target_plan == "pro" else "Rs.1,499"
    
    now = datetime.utcnow()
    subscription_end = now + timedelta(days=30)
    
    await db.users.update_one(
        {"id": user.id},
        {"$set": {
            "plan": plan_enum.value,
            "subscription_start": now,
            "subscription_end": subscription_end,
            "mocks_taken_this_month": 0,
            "updated_at": now
        }}
    )
    
    # Send admin notification
    if background_tasks:
        background_tasks.add_task(
            send_admin_email,
            f"New Subscription: {user.name} → {plan_enum.value.upper()}",
            subscription_email_html(user.name, user.email, plan_enum.value.upper(), amount)
        )
    
    return APIResponse(
        success=True,
        message=f"Plan upgraded to {plan_enum.value}",
        data={
            "plan": plan_enum.value,
            "subscription_start": now.isoformat(),
            "subscription_end": subscription_end.isoformat(),
            "message": f"Your {plan_enum.value.upper()} plan is active for 30 days until {subscription_end.strftime('%d %b %Y')}"
        }
    )

# ==================== Admin Endpoints ====================

ADMIN_SECRET = os.environ.get('ADMIN_SECRET', 'crackcuet_admin_2025')

async def verify_admin(authorization: str = Header(None)):
    """Verify admin access via secret key."""
    if not authorization or authorization != f"Admin {ADMIN_SECRET}":
        raise HTTPException(status_code=403, detail="Admin access required")
    return True

@api_router.get("/admin/stats")
async def get_admin_stats(admin: bool = Depends(verify_admin)):
    """Get platform statistics for admin dashboard."""
    total_users = await db.users.count_documents({})
    total_attempts = await db.test_attempts.count_documents({})
    total_mocks = await db.mock_tests.count_documents({})
    
    # Plan distribution
    free_users = await db.users.count_documents({"plan": "free"})
    pro_users = await db.users.count_documents({"plan": "pro"})
    premium_users = await db.users.count_documents({"plan": "premium"})
    
    # Recent signups (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_signups = await db.users.count_documents({"created_at": {"$gte": week_ago}})
    
    # Today's signups
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_signups = await db.users.count_documents({"created_at": {"$gte": today_start}})
    
    return APIResponse(
        success=True,
        message="Admin stats retrieved",
        data={
            "total_users": total_users,
            "total_attempts": total_attempts,
            "total_mocks": total_mocks,
            "plan_distribution": {
                "free": free_users,
                "pro": pro_users,
                "premium": premium_users
            },
            "recent_signups": recent_signups,
            "today_signups": today_signups
        }
    )

@api_router.get("/admin/users")
async def get_all_users(
    admin: bool = Depends(verify_admin),
    skip: int = 0,
    limit: int = 50,
    search: str = None
):
    """Get all users for admin dashboard."""
    query = {}
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}}
        ]
    
    users = await db.users.find(query, {"_id": 0, "password": 0}).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    total = await db.users.count_documents(query)
    
    # Add attempt count for each user
    for user in users:
        user["attempt_count"] = await db.test_attempts.count_documents({"user_id": user["id"]})
    
    return APIResponse(
        success=True,
        message="Users retrieved",
        data={"users": users, "total": total}
    )

class AdminUserUpdate(PydanticBaseModel):
    plan: Optional[str] = None

@api_router.patch("/admin/users/{user_id}")
async def update_user_by_admin(user_id: str, update: AdminUserUpdate, background_tasks: BackgroundTasks, admin: bool = Depends(verify_admin)):
    """Update a user's plan or details by admin."""
    now = datetime.utcnow()
    update_fields = {"updated_at": now}
    
    if update.plan and update.plan in ["free", "pro", "premium"]:
        update_fields["plan"] = update.plan
        if update.plan in ("pro", "premium"):
            update_fields["subscription_start"] = now
            update_fields["subscription_end"] = now + timedelta(days=30)
            update_fields["mocks_taken_this_month"] = 0
        else:
            update_fields["subscription_start"] = None
            update_fields["subscription_end"] = None
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_fields})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Send email if plan changed to paid
    if update.plan in ("pro", "premium"):
        user_data = await db.users.find_one({"id": user_id}, {"_id": 0, "name": 1, "email": 1})
        if user_data:
            amount = "Rs.999" if update.plan == "pro" else "Rs.1,499"
            background_tasks.add_task(
                send_admin_email,
                f"Admin Plan Change: {user_data['name']} → {update.plan.upper()}",
                subscription_email_html(user_data["name"], user_data["email"], update.plan.upper(), amount)
            )
    
    return APIResponse(
        success=True,
        message="User updated successfully",
        data={"user_id": user_id, "updated_fields": list(update_fields.keys())}
    )

@api_router.get("/admin/users/{user_id}/details")
async def get_user_details(user_id: str, admin: bool = Depends(verify_admin)):
    """Get detailed info about a specific user."""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's attempts
    attempts = await db.test_attempts.find(
        {"user_id": user_id}, 
        {"_id": 0}
    ).sort("submitted_at", -1).limit(20).to_list(20)
    
    return APIResponse(
        success=True,
        message="User details retrieved",
        data={"user": user, "recent_attempts": attempts}
    )

# ==================== Contact Form ====================

class ContactFormRequest(PydanticBaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str

@api_router.post("/contact", response_model=APIResponse)
async def submit_contact_form(form_data: ContactFormRequest):
    """Submit a contact form inquiry."""
    inquiry = {
        "id": str(uuid.uuid4()),
        "name": form_data.name,
        "email": form_data.email,
        "phone": form_data.phone,
        "message": form_data.message,
        "status": "new",
        "created_at": datetime.utcnow()
    }
    
    await db.contact_inquiries.insert_one(inquiry)
    
    return APIResponse(
        success=True,
        message="Thank you for reaching out! We'll get back to you soon.",
        data={"inquiry_id": inquiry["id"]}
    )

@api_router.get("/admin/inquiries")
async def get_contact_inquiries(admin: bool = Depends(verify_admin)):
    """Get all contact form inquiries."""
    inquiries = await db.contact_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return APIResponse(
        success=True,
        message="Inquiries retrieved",
        data={"inquiries": inquiries, "total": len(inquiries)}
    )

# ==================== Health Check ====================

@api_router.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "CUET Mock Test Platform API is running", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    """Detailed health check."""
    try:
        # Check MongoDB connection
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown."""
    client.close()
