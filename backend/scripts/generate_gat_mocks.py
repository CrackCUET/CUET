"""
CUET General Aptitude Test (GAT) Mock Generator
Generates 20 comprehensive mocks following CUET General Test syllabus
Each mock: 50 questions, 60 minutes
Sections: GK/Current Affairs (40-45%), Reasoning (35-38%), Quantitative (25-30%)
"""
import os
import sys
import json
import uuid
import asyncio
from datetime import datetime
from typing import List, Dict

sys.path.insert(0, '/app/backend')
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path('/app/backend/.env'))

from motor.motor_asyncio import AsyncIOMotorClient

# Gemini setup
import google.generativeai as genai
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash')

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Question distribution per mock (50 questions total)
# GK/Current Affairs: ~22 questions (44%)
# Reasoning: ~18 questions (36%)
# Quantitative: ~10 questions (20%)
QUESTION_DISTRIBUTION = {
    # GK & Current Affairs (22 questions)
    "indian_history": 3,
    "indian_geography": 2,
    "indian_polity": 3,
    "general_science": 2,
    "current_affairs_national": 4,
    "current_affairs_international": 3,
    "sports_awards": 2,
    "books_authors_inventions": 3,
    
    # Reasoning (18 questions)
    "coding_decoding": 3,
    "blood_relations": 2,
    "direction_test": 2,
    "analogies_classification": 3,
    "statement_conclusion": 2,
    "series_completion": 3,
    "analytical_reasoning": 3,
    
    # Quantitative (10 questions)
    "number_system_algebra": 2,
    "percentage_profit_loss": 2,
    "time_work_speed": 2,
    "ratio_proportion": 2,
    "data_interpretation": 2,
}

# Topic-specific prompts
def get_gk_prompt(topic: str, count: int, mock_num: int) -> str:
    """Generate prompt for GK questions."""
    topic_details = {
        "indian_history": "Ancient, Medieval, and Modern Indian History including major dynasties, battles, freedom struggle, important dates",
        "indian_geography": "Physical features, rivers, mountains, climate, resources, states and capitals of India",
        "indian_polity": "Constitution, Fundamental Rights, Directive Principles, Parliament, Judiciary, Important Articles and Amendments",
        "general_science": "Physics, Chemistry, Biology basics - everyday science applications, human body, environment",
        "current_affairs_national": "Recent national events, government schemes, appointments, awards from last 6 months",
        "current_affairs_international": "International events, summits, organizations, world leaders, global developments",
        "sports_awards": "Recent sports events, winners, national and international awards, Padma awards, Nobel Prize",
        "books_authors_inventions": "Famous books and their authors, scientific inventions and inventors, discoveries"
    }
    
    return f"""Generate {count} CUET General Test level MCQ questions on {topic.replace('_', ' ').title()}.

TOPIC FOCUS: {topic_details.get(topic, topic)}
MOCK TEST: {mock_num}

REQUIREMENTS:
1. Questions should be factual and test knowledge
2. Difficulty: Moderate to Challenging (university entrance level)
3. Include recent facts and updates where applicable
4. Options should be plausible but only one clearly correct

OUTPUT FORMAT (JSON):
{{
    "questions": [
        {{
            "question_text": "Clear, concise question",
            "options": [
                {{"id": "A", "text": "Option A"}},
                {{"id": "B", "text": "Option B"}},
                {{"id": "C", "text": "Option C"}},
                {{"id": "D", "text": "Option D"}}
            ],
            "correct_answer": "B",
            "explanation": "Brief explanation of why B is correct",
            "topic": "general_knowledge",
            "subtopic": "{topic}"
        }}
    ]
}}

Generate exactly {count} unique, high-quality questions. Output ONLY valid JSON."""

def get_reasoning_prompt(topic: str, count: int, mock_num: int) -> str:
    """Generate prompt for reasoning questions."""
    topic_details = {
        "coding_decoding": "Letter/number coding patterns, symbol substitution, coded messages",
        "blood_relations": "Family relationships, determining relations between people",
        "direction_test": "Direction sense, turns, distance calculations, final position",
        "analogies_classification": "Word analogies, odd one out, classification based on common properties",
        "statement_conclusion": "Logical conclusions from given statements, valid inferences",
        "series_completion": "Number series, letter series, alphanumeric series patterns",
        "analytical_reasoning": "Seating arrangements, rankings, puzzles, logical deductions"
    }
    
    return f"""Generate {count} CUET General Test level Reasoning MCQ questions on {topic.replace('_', ' ').title()}.

TOPIC FOCUS: {topic_details.get(topic, topic)}
MOCK TEST: {mock_num}

REQUIREMENTS:
1. Questions should test logical thinking and analytical skills
2. Include clear problem statements
3. Difficulty: Moderate to Challenging
4. Each question should have one definitive correct answer

OUTPUT FORMAT (JSON):
{{
    "questions": [
        {{
            "question_text": "Complete question with all necessary information",
            "options": [
                {{"id": "A", "text": "Option A"}},
                {{"id": "B", "text": "Option B"}},
                {{"id": "C", "text": "Option C"}},
                {{"id": "D", "text": "Option D"}}
            ],
            "correct_answer": "C",
            "explanation": "Step-by-step explanation of the solution",
            "topic": "reasoning",
            "subtopic": "{topic}"
        }}
    ]
}}

Generate exactly {count} unique questions. Output ONLY valid JSON."""

def get_quantitative_prompt(topic: str, count: int, mock_num: int) -> str:
    """Generate prompt for quantitative questions."""
    topic_details = {
        "number_system_algebra": "Basic operations, HCF/LCM, simplification, algebraic expressions (up to Grade 8)",
        "percentage_profit_loss": "Percentage calculations, profit/loss problems, discount calculations",
        "time_work_speed": "Time and work problems, speed-distance-time, trains, boats and streams",
        "ratio_proportion": "Ratios, proportions, partnership problems, mixture problems",
        "data_interpretation": "Tables, bar graphs, pie charts - reading and calculating from data"
    }
    
    return f"""Generate {count} CUET General Test level Quantitative MCQ questions on {topic.replace('_', ' ').title()}.

TOPIC FOCUS: {topic_details.get(topic, topic)}
DIFFICULTY: Up to Grade 8 mathematics level
MOCK TEST: {mock_num}

REQUIREMENTS:
1. Questions should be solvable within 1-2 minutes
2. Use realistic numbers and scenarios
3. Calculations should not be too complex
4. Clear problem statement with all necessary data

OUTPUT FORMAT (JSON):
{{
    "questions": [
        {{
            "question_text": "Complete question with numerical data",
            "options": [
                {{"id": "A", "text": "Option A"}},
                {{"id": "B", "text": "Option B"}},
                {{"id": "C", "text": "Option C"}},
                {{"id": "D", "text": "Option D"}}
            ],
            "correct_answer": "A",
            "explanation": "Step-by-step calculation showing the solution",
            "topic": "quantitative",
            "subtopic": "{topic}"
        }}
    ]
}}

Generate exactly {count} unique questions. Output ONLY valid JSON."""

async def generate_questions_with_retry(prompt: str, max_retries: int = 3) -> Dict:
    """Generate questions using Gemini with retry logic."""
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean JSON
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            text = text.strip()
            
            return json.loads(text)
        except Exception as e:
            print(f"    Attempt {attempt + 1} failed: {str(e)[:80]}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2)
    return None

async def generate_mock_test(mock_num: int, client: AsyncIOMotorClient) -> Dict:
    """Generate a single complete GAT mock test."""
    db = client[DB_NAME]
    
    print(f"\n{'='*60}")
    print(f"Generating General Aptitude Test Mock {mock_num}/20")
    print(f"{'='*60}")
    
    all_questions = []
    question_num = 1
    
    # GK & Current Affairs questions
    gk_topics = ["indian_history", "indian_geography", "indian_polity", "general_science",
                 "current_affairs_national", "current_affairs_international", 
                 "sports_awards", "books_authors_inventions"]
    
    for topic in gk_topics:
        count = QUESTION_DISTRIBUTION[topic]
        print(f"\n  Generating {topic.replace('_', ' ').title()} ({count} questions)...")
        
        prompt = get_gk_prompt(topic, count, mock_num)
        result = await generate_questions_with_retry(prompt)
        
        if result and "questions" in result:
            for q in result["questions"][:count]:
                q["id"] = str(uuid.uuid4())
                q["question_number"] = question_num
                all_questions.append(q)
                question_num += 1
            print(f"    ✓ Generated {min(len(result['questions']), count)} questions")
        else:
            print(f"    ✗ Failed")
    
    # Reasoning questions
    reasoning_topics = ["coding_decoding", "blood_relations", "direction_test",
                       "analogies_classification", "statement_conclusion", 
                       "series_completion", "analytical_reasoning"]
    
    for topic in reasoning_topics:
        count = QUESTION_DISTRIBUTION[topic]
        print(f"\n  Generating {topic.replace('_', ' ').title()} ({count} questions)...")
        
        prompt = get_reasoning_prompt(topic, count, mock_num)
        result = await generate_questions_with_retry(prompt)
        
        if result and "questions" in result:
            for q in result["questions"][:count]:
                q["id"] = str(uuid.uuid4())
                q["question_number"] = question_num
                all_questions.append(q)
                question_num += 1
            print(f"    ✓ Generated {min(len(result['questions']), count)} questions")
        else:
            print(f"    ✗ Failed")
    
    # Quantitative questions
    quant_topics = ["number_system_algebra", "percentage_profit_loss", 
                    "time_work_speed", "ratio_proportion", "data_interpretation"]
    
    for topic in quant_topics:
        count = QUESTION_DISTRIBUTION[topic]
        print(f"\n  Generating {topic.replace('_', ' ').title()} ({count} questions)...")
        
        prompt = get_quantitative_prompt(topic, count, mock_num)
        result = await generate_questions_with_retry(prompt)
        
        if result and "questions" in result:
            for q in result["questions"][:count]:
                q["id"] = str(uuid.uuid4())
                q["question_number"] = question_num
                all_questions.append(q)
                question_num += 1
            print(f"    ✓ Generated {min(len(result['questions']), count)} questions")
        else:
            print(f"    ✗ Failed")
    
    # Create mock test document
    mock_id = str(uuid.uuid4())
    mock_test = {
        "id": mock_id,
        "subject": "General Aptitude Test",
        "title": f"General Aptitude Test - Mock Test {mock_num}",
        "description": f"Comprehensive CUET GAT Mock #{mock_num} - GK, Current Affairs, Reasoning & Quantitative",
        "total_questions": len(all_questions),
        "duration_minutes": 60,
        "difficulty": "medium" if mock_num <= 10 else "hard",
        "total_marks": len(all_questions) * 5,
        "marking_scheme": {
            "correct": 5,
            "incorrect": -1,
            "unattempted": 0
        },
        "question_ids": [q["id"] for q in all_questions],
        "questions": all_questions,
        "is_active": True,
        "is_free_mock": mock_num == 1,
        "question_generation_status": "completed",
        "syllabus_coverage": {
            "general_knowledge": 22,
            "reasoning": 18,
            "quantitative": 10
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Save to database
    await db.mock_tests.insert_one(mock_test)
    
    # Save questions separately
    for q in all_questions:
        q["mock_test_id"] = mock_id
        q["subject"] = "General Aptitude Test"
        q["created_at"] = datetime.utcnow()
    
    if all_questions:
        await db.questions.insert_many(all_questions)
    
    print(f"\n  ✅ Mock Test {mock_num} saved: {len(all_questions)} questions")
    return mock_test

async def main():
    """Generate 20 General Aptitude Test mocks."""
    print("="*60)
    print("CUET General Aptitude Test Mock Generator")
    print("="*60)
    print(f"Database: {DB_NAME}")
    print("Target: 20 mock tests, 50 questions each")
    print("="*60)
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Check existing GAT mocks
    existing = await db.mock_tests.count_documents({"subject": "General Aptitude Test"})
    print(f"\nExisting GAT mocks: {existing}")
    
    # Delete old GAT mocks to regenerate fresh ones
    if existing > 0:
        print("Removing old GAT mocks to generate comprehensive new ones...")
        old_mocks = await db.mock_tests.find({"subject": "General Aptitude Test"}, {"id": 1}).to_list(100)
        old_ids = [m["id"] for m in old_mocks]
        await db.mock_tests.delete_many({"subject": "General Aptitude Test"})
        await db.questions.delete_many({"subject": "General Aptitude Test"})
        print(f"Deleted {len(old_ids)} old GAT mocks")
    
    # Generate 20 new mocks
    total_questions = 0
    for mock_num in range(1, 21):
        try:
            mock = await generate_mock_test(mock_num, client)
            total_questions += mock["total_questions"]
            
            # Rate limiting
            if mock_num < 20:
                print(f"\n  Waiting 5 seconds...")
                await asyncio.sleep(5)
                
        except Exception as e:
            print(f"\n  ❌ Error generating mock {mock_num}: {e}")
            continue
    
    # Final summary
    final_count = await db.mock_tests.count_documents({"subject": "General Aptitude Test"})
    final_questions = await db.questions.count_documents({"subject": "General Aptitude Test"})
    
    print("\n" + "="*60)
    print("GENERATION COMPLETE!")
    print("="*60)
    print(f"Total GAT Mocks: {final_count}")
    print(f"Total Questions: {final_questions}")
    print("="*60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
