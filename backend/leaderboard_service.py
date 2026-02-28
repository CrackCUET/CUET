"""Leaderboard service for CUET Mock Test Platform"""
import random
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from models import LeaderboardEntry, LeaderboardResponse
import uuid

# Synthetic names for seeded leaderboard
SYNTHETIC_NAMES = [
    "Aarav S.", "Priya M.", "Arjun K.", "Ananya R.", "Vihaan P.",
    "Ishaan D.", "Aanya S.", "Advait G.", "Diya T.", "Reyansh M.",
    "Saanvi K.", "Kabir J.", "Avni P.", "Shaurya B.", "Myra V.",
    "Aditya N.", "Kiara S.", "Vivaan R.", "Anvi M.", "Dhruv A.",
    "Pari L.", "Krishna T.", "Ira G.", "Ayaan C.", "Sara B.",
    "Arnav H.", "Aisha P.", "Atharv S.", "Zara K.", "Rudra M.",
    "Nisha R.", "Yash V.", "Kavya D.", "Rohan J.", "Meera N.",
    "Aryan G.", "Tara P.", "Karan S.", "Riya B.", "Dev T.",
    "Siya M.", "Nikhil R.", "Pooja K.", "Rahul V.", "Neha G.",
    "Amit S.", "Shreya P.", "Vikram D.", "Anjali M.", "Raj K.",
    "Sneha B.", "Akash T.", "Divya R.", "Mohit S.", "Swati N.",
    "Deepak G.", "Komal P.", "Arun M.", "Rekha K.", "Suresh V.",
    "Manish D.", "Seema B.", "Rajesh T.", "Nandini R.", "Sanjay S.",
    "Pallavi M.", "Vinod K.", "Sunita G.", "Prakash P.", "Geeta D.",
    "Ashok B.", "Lakshmi T.", "Ramesh R.", "Uma S.", "Mohan M.",
    "Jaya K.", "Sunil V.", "Priti G.", "Manoj P.", "Rani D.",
    "Vijay B.", "Shobha T.", "Anil R.", "Kamala S.", "Dinesh M.",
    "Saroj K.", "Naresh V.", "Usha G.", "Girish P.", "Padma D.",
    "Mukesh B.", "Sushma T.", "Rakesh R.", "Veena S.", "Ajay M.",
    "Bharti K.", "Pankaj V.", "Shashi G.", "Anup P.", "Kiran D."
]

def generate_synthetic_leaderboard(
    subject: str,
    mock_test_id: str,
    count: int = 100
) -> List[LeaderboardEntry]:
    """Generate synthetic leaderboard entries for baseline competition."""
    
    entries = []
    used_names = set()
    
    # Generate scores with realistic distribution
    # Top performers: 200-245 (top 10%)
    # Good performers: 150-200 (next 30%)
    # Average performers: 100-150 (next 40%)
    # Below average: 50-100 (bottom 20%)
    
    for i in range(count):
        # Select unique name
        available_names = [n for n in SYNTHETIC_NAMES if n not in used_names]
        if not available_names:
            name = f"Student_{i+1}"
        else:
            name = random.choice(available_names)
            used_names.add(name)
        
        # Generate score based on distribution
        rand = random.random()
        if rand < 0.10:  # Top 10%
            score = random.randint(200, 245)
        elif rand < 0.40:  # Next 30%
            score = random.randint(150, 199)
        elif rand < 0.80:  # Next 40%
            score = random.randint(100, 149)
        else:  # Bottom 20%
            score = random.randint(50, 99)
        
        # Generate time taken (faster for higher scores generally)
        base_time = 3600 - (score * 5)  # Higher score = less time
        time_variance = random.randint(-300, 300)
        time_taken = max(1800, min(3600, base_time + time_variance))
        
        entry = LeaderboardEntry(
            user_id=f"synthetic_{uuid.uuid4()}",
            user_name=name,
            subject=subject,
            mock_test_id=mock_test_id,
            attempt_id=f"synthetic_attempt_{uuid.uuid4()}",
            score=score,
            time_taken_seconds=time_taken,
            rank=0,  # Will be calculated
            percentile=0.0,  # Will be calculated
            is_synthetic=True
        )
        entries.append(entry)
    
    # Sort by score (descending), then by time (ascending) for tie-breaker
    entries.sort(key=lambda x: (-x.score, x.time_taken_seconds))
    
    # Assign ranks and percentiles
    total = len(entries)
    for i, entry in enumerate(entries):
        entry.rank = i + 1
        entry.percentile = round(((total - entry.rank) / total) * 100, 2)
    
    return entries

def calculate_rank_and_percentile(
    score: int,
    time_taken: int,
    leaderboard_entries: List[LeaderboardEntry]
) -> Tuple[int, float]:
    """Calculate rank and percentile for a new score."""
    
    # Count how many entries the new score beats
    better_than = 0
    equal_count = 0
    
    for entry in leaderboard_entries:
        if score > entry.score:
            better_than += 1
        elif score == entry.score:
            if time_taken < entry.time_taken_seconds:
                better_than += 1
            elif time_taken == entry.time_taken_seconds:
                equal_count += 1
    
    total = len(leaderboard_entries) + 1  # Including the new entry
    rank = total - better_than - equal_count
    percentile = round((better_than / total) * 100, 2)
    
    return rank, percentile

def get_nearby_ranks(
    user_rank: int,
    leaderboard_entries: List[LeaderboardEntry],
    range_above: int = 5,
    range_below: int = 5
) -> List[LeaderboardEntry]:
    """Get entries near the user's rank."""
    
    # Sort by rank
    sorted_entries = sorted(leaderboard_entries, key=lambda x: x.rank)
    
    # Find start and end indices
    start_rank = max(1, user_rank - range_above)
    end_rank = user_rank + range_below
    
    nearby = [e for e in sorted_entries if start_rank <= e.rank <= end_rank]
    
    return nearby

def get_top_performers(
    leaderboard_entries: List[LeaderboardEntry],
    count: int = 10
) -> List[LeaderboardEntry]:
    """Get top N performers."""
    
    sorted_entries = sorted(leaderboard_entries, key=lambda x: x.rank)
    return sorted_entries[:count]

def calculate_rank_delta(
    current_rank: int,
    previous_rank: int
) -> Dict:
    """Calculate rank change and generate message."""
    
    delta = previous_rank - current_rank
    
    if delta > 0:
        return {
            "delta": delta,
            "direction": "up",
            "message": f"↑ {delta} ranks since your last mock"
        }
    elif delta < 0:
        return {
            "delta": abs(delta),
            "direction": "down",
            "message": f"↓ {abs(delta)} ranks since your last mock"
        }
    else:
        return {
            "delta": 0,
            "direction": "same",
            "message": "Same rank as your last mock"
        }

def calculate_next_rank_gap(
    user_rank: int,
    user_score: int,
    leaderboard_entries: List[LeaderboardEntry]
) -> Dict:
    """Calculate score needed to reach next rank."""
    
    sorted_entries = sorted(leaderboard_entries, key=lambda x: x.rank)
    
    # Find entry with rank just above user
    for entry in sorted_entries:
        if entry.rank == user_rank - 1:
            gap = entry.score - user_score
            return {
                "next_rank": entry.rank,
                "score_gap": max(1, gap),
                "message": f"+{max(1, gap)} marks to reach Rank {entry.rank}"
            }
    
    return {
        "next_rank": 1,
        "score_gap": 0,
        "message": "You're at the top!"
    }

def get_percentile_message(percentile: float) -> str:
    """Generate motivational message based on percentile."""
    
    if percentile >= 99:
        return f"🏆 You're in the top 1%! Outstanding performance!"
    elif percentile >= 95:
        return f"⭐ You're ahead of {percentile}% of aspirants! Excellent!"
    elif percentile >= 90:
        return f"🎯 Top {100-percentile:.1f}% nationwide. Keep pushing!"
    elif percentile >= 75:
        return f"📈 You're ahead of {percentile}% of aspirants. Room to grow!"
    elif percentile >= 50:
        return f"💪 You're in the top half. Time to step up!"
    else:
        return f"🔥 {percentile}% percentile. Every attempt makes you stronger!"

def assign_badges(score: int, percentile: float, streak_days: int) -> List[str]:
    """Assign performance badges based on metrics."""
    
    badges = []
    
    # Score-based badges
    if score >= 225:  # 90%+ accuracy
        badges.append("High Accuracy (90%+)")
    elif score >= 200:  # 80%+ accuracy
        badges.append("Strong Performer")
    
    # Percentile-based badges
    if percentile >= 99:
        badges.append("Top 1% Elite")
    elif percentile >= 95:
        badges.append("Top 5% Performer")
    elif percentile >= 90:
        badges.append("Top 10% Achiever")
    
    # Streak badges
    if streak_days >= 30:
        badges.append("30-Day Warrior")
    elif streak_days >= 14:
        badges.append("14-Day Streak")
    elif streak_days >= 7:
        badges.append("7-Day Streak")
    
    return badges
