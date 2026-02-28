"""
CUET English Mock Test Generator
Generates 20 comprehensive English mock tests following CUET syllabus
Each mock: 50 questions, 60 minutes, covering all syllabus areas
"""
import os
import sys
import json
import uuid
import asyncio
import random
from datetime import datetime
from typing import List, Dict, Any

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

# CUET English Syllabus Topics with question distribution per mock (50 questions total)
QUESTION_DISTRIBUTION = {
    "reading_comprehension_1": 5,      # Passage 1 - Narrative
    "reading_comprehension_2": 5,      # Passage 2 - Factual  
    "reading_comprehension_3": 5,      # Passage 3 - Literary/Argumentative
    "synonyms": 4,
    "antonyms": 4,
    "idioms_phrases": 4,
    "one_word_substitutes": 3,
    "vocabulary_context": 3,
    "sentence_rearrangement": 4,
    "fill_blanks_grammar": 4,
    "error_spotting": 4,
    "voice_narration": 3,
    "phrasal_verbs": 2,
}

# Reading Comprehension Passage Topics for variety
RC_TOPICS = {
    "narrative": [
        "A story about perseverance and success",
        "An inspiring tale of a social reformer",
        "A narrative about scientific discovery",
        "A story highlighting cultural heritage",
        "An account of environmental conservation efforts",
        "A narrative about technological innovation",
        "A story about educational transformation",
        "An inspiring sports achievement narrative",
        "A tale of artistic excellence",
        "A narrative about community development"
    ],
    "factual": [
        "Climate change and its global impact",
        "Artificial Intelligence in modern society",
        "Space exploration achievements",
        "Healthcare advancements in India",
        "Digital transformation in education",
        "Renewable energy sources",
        "Indian economy and development",
        "Biodiversity conservation",
        "Water resource management",
        "Urban planning and smart cities"
    ],
    "literary": [
        "The importance of literature in society",
        "Art and cultural expression",
        "Philosophy of education",
        "Human rights and dignity",
        "Youth and nation building",
        "The role of media in democracy",
        "Ethics in professional life",
        "Globalization and its effects",
        "Science and human progress",
        "Nature and environmental ethics"
    ]
}

def get_rc_prompt(passage_type: str, topic: str, mock_num: int) -> str:
    """Generate prompt for reading comprehension passage and questions."""
    return f"""Generate a CUET-level Reading Comprehension passage and 5 MCQ questions.

PASSAGE TYPE: {passage_type.upper()} ({topic})
MOCK TEST: {mock_num}

REQUIREMENTS:
1. Generate a passage of 250-300 words that is:
   - Intellectually challenging and thought-provoking
   - Well-structured with clear arguments/narrative
   - Suitable for university entrance exam level
   - Contains sophisticated vocabulary

2. Generate exactly 5 MCQ questions covering:
   - Q1: Main idea/central theme of the passage
   - Q2: Vocabulary in context (meaning of a word/phrase from passage)
   - Q3: Inference/deduction question
   - Q4: Specific detail from the passage
   - Q5: Author's tone/purpose OR conclusion-based question

OUTPUT FORMAT (JSON):
{{
    "passage": "Full passage text here...",
    "questions": [
        {{
            "question_text": "Question about the passage",
            "options": [
                {{"id": "A", "text": "Option A"}},
                {{"id": "B", "text": "Option B"}},
                {{"id": "C", "text": "Option C"}},
                {{"id": "D", "text": "Option D"}}
            ],
            "correct_answer": "B",
            "explanation": "Detailed explanation of why B is correct",
            "topic": "reading_comprehension",
            "subtopic": "{passage_type}"
        }}
    ]
}}

Generate challenging questions where wrong options are plausible but clearly incorrect upon careful reading.
Output ONLY valid JSON, no other text."""

def get_vocabulary_prompt(vocab_type: str, count: int, mock_num: int) -> str:
    """Generate prompt for vocabulary questions."""
    type_instructions = {
        "synonyms": "Find the word that is MOST SIMILAR in meaning to the given word",
        "antonyms": "Find the word that is MOST OPPOSITE in meaning to the given word",
        "idioms_phrases": "Identify the correct meaning of the given idiom/phrase",
        "one_word_substitutes": "Choose the single word that best describes the given phrase/definition",
        "vocabulary_context": "Choose the word that best fits the context of the sentence"
    }
    
    word_lists = {
        "synonyms": ["ameliorate", "ubiquitous", "ephemeral", "cacophony", "sanguine", "pragmatic", "exacerbate", "elucidate", "paradigm", "meticulous", "arduous", "magnanimous", "tenacious", "prolific", "spurious", "candid", "benevolent", "audacious", "pragmatic", "voracious"],
        "antonyms": ["lucid", "affluent", "tranquil", "verbose", "austere", "gregarious", "benign", "candid", "diligent", "ephemeral", "prudent", "sanguine", "serene", "volatile", "zealous", "taciturn", "mundane", "prolific", "ardent", "frugal"]
    }
    
    return f"""Generate {count} CUET-level {vocab_type.replace('_', ' ').title()} MCQ questions.

MOCK TEST: {mock_num}
INSTRUCTION: {type_instructions.get(vocab_type, 'Answer the vocabulary question')}

REQUIREMENTS:
1. Questions should be challenging but fair
2. Use sophisticated vocabulary suitable for competitive exams
3. Wrong options should be plausible distractors
4. Each question should test a different word/concept

OUTPUT FORMAT (JSON):
{{
    "questions": [
        {{
            "question_text": "Find the synonym of 'AMELIORATE':",
            "options": [
                {{"id": "A", "text": "Worsen"}},
                {{"id": "B", "text": "Improve"}},
                {{"id": "C", "text": "Maintain"}},
                {{"id": "D", "text": "Destroy"}}
            ],
            "correct_answer": "B",
            "explanation": "'Ameliorate' means to make something better or improve it.",
            "topic": "vocabulary",
            "subtopic": "{vocab_type}"
        }}
    ]
}}

Generate exactly {count} unique questions. Output ONLY valid JSON."""

def get_grammar_prompt(grammar_type: str, count: int, mock_num: int) -> str:
    """Generate prompt for grammar questions."""
    type_instructions = {
        "sentence_rearrangement": "Arrange the jumbled parts to form a meaningful sentence",
        "fill_blanks_grammar": "Fill in the blank with the most appropriate word (articles, prepositions, verb forms)",
        "error_spotting": "Identify the part of the sentence that contains an error",
        "voice_narration": "Convert between Active/Passive voice or Direct/Indirect speech",
        "phrasal_verbs": "Choose the correct meaning of the phrasal verb or use it correctly"
    }
    
    return f"""Generate {count} CUET-level {grammar_type.replace('_', ' ').title()} MCQ questions.

MOCK TEST: {mock_num}
TYPE: {type_instructions.get(grammar_type, 'Grammar question')}

REQUIREMENTS:
1. Questions should test practical grammar understanding
2. Cover various grammar rules: tenses, articles, prepositions, subject-verb agreement
3. Include sentences on diverse topics
4. Error spotting: divide sentence into parts (A), (B), (C), (D) with one containing error

OUTPUT FORMAT (JSON):
{{
    "questions": [
        {{
            "question_text": "The sentence question or instruction",
            "options": [
                {{"id": "A", "text": "Option A"}},
                {{"id": "B", "text": "Option B"}},
                {{"id": "C", "text": "Option C"}},
                {{"id": "D", "text": "Option D"}}
            ],
            "correct_answer": "C",
            "explanation": "Detailed grammar explanation",
            "topic": "grammar",
            "subtopic": "{grammar_type}"
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
            print(f"  Attempt {attempt + 1} failed: {str(e)[:100]}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2)
    return None

async def generate_mock_test(mock_num: int, client: AsyncIOMotorClient) -> Dict:
    """Generate a single complete mock test."""
    db = client[DB_NAME]
    
    print(f"\n{'='*60}")
    print(f"Generating English Mock Test {mock_num}/20")
    print(f"{'='*60}")
    
    all_questions = []
    question_num = 1
    
    # 1. Generate Reading Comprehension Passages (3 passages, 5 questions each)
    for i, passage_type in enumerate(["narrative", "factual", "literary"]):
        topic = RC_TOPICS[passage_type][(mock_num - 1) % len(RC_TOPICS[passage_type])]
        print(f"\n  Generating {passage_type.title()} RC passage ({topic[:30]}...)...")
        
        prompt = get_rc_prompt(passage_type, topic, mock_num)
        result = await generate_questions_with_retry(prompt)
        
        if result and "questions" in result:
            passage_text = result.get("passage", "")
            for q in result["questions"]:
                q["id"] = str(uuid.uuid4())
                q["question_number"] = question_num
                q["passage"] = passage_text if question_num % 5 == 1 else None  # Only include passage with first question
                q["passage_reference"] = f"Passage {i+1}" if passage_text else None
                all_questions.append(q)
                question_num += 1
            print(f"    ✓ Generated {len(result['questions'])} RC questions")
        else:
            print(f"    ✗ Failed to generate RC questions")
    
    # 2. Generate Vocabulary Questions
    vocab_types = ["synonyms", "antonyms", "idioms_phrases", "one_word_substitutes", "vocabulary_context"]
    for vocab_type in vocab_types:
        count = QUESTION_DISTRIBUTION[vocab_type]
        print(f"\n  Generating {vocab_type.replace('_', ' ').title()} ({count} questions)...")
        
        prompt = get_vocabulary_prompt(vocab_type, count, mock_num)
        result = await generate_questions_with_retry(prompt)
        
        if result and "questions" in result:
            for q in result["questions"][:count]:
                q["id"] = str(uuid.uuid4())
                q["question_number"] = question_num
                all_questions.append(q)
                question_num += 1
            print(f"    ✓ Generated {min(len(result['questions']), count)} questions")
        else:
            print(f"    ✗ Failed to generate {vocab_type} questions")
    
    # 3. Generate Grammar Questions
    grammar_types = ["sentence_rearrangement", "fill_blanks_grammar", "error_spotting", "voice_narration", "phrasal_verbs"]
    for grammar_type in grammar_types:
        count = QUESTION_DISTRIBUTION[grammar_type]
        print(f"\n  Generating {grammar_type.replace('_', ' ').title()} ({count} questions)...")
        
        prompt = get_grammar_prompt(grammar_type, count, mock_num)
        result = await generate_questions_with_retry(prompt)
        
        if result and "questions" in result:
            for q in result["questions"][:count]:
                q["id"] = str(uuid.uuid4())
                q["question_number"] = question_num
                all_questions.append(q)
                question_num += 1
            print(f"    ✓ Generated {min(len(result['questions']), count)} questions")
        else:
            print(f"    ✗ Failed to generate {grammar_type} questions")
    
    # Create mock test document
    mock_id = str(uuid.uuid4())
    mock_test = {
        "id": mock_id,
        "subject": "English",
        "title": f"English - Mock Test {mock_num}",
        "description": f"Comprehensive CUET English Mock Test #{mock_num} covering Reading Comprehension, Vocabulary, and Grammar",
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
            "reading_comprehension": 15,
            "vocabulary": 18,
            "grammar": 17
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Save to database
    await db.mock_tests.insert_one(mock_test)
    
    # Save questions separately
    for q in all_questions:
        q["mock_test_id"] = mock_id
        q["subject"] = "English"
        q["created_at"] = datetime.utcnow()
    
    await db.questions.insert_many(all_questions)
    
    print(f"\n  ✅ Mock Test {mock_num} saved: {len(all_questions)} questions")
    return mock_test

async def main():
    """Generate 20 English mock tests."""
    print("="*60)
    print("CUET English Mock Test Generator")
    print("="*60)
    print(f"Database: {DB_NAME}")
    print("Target: 20 mock tests, 50 questions each")
    print("="*60)
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Check existing English mocks
    existing = await db.mock_tests.count_documents({"subject": "English"})
    print(f"\nExisting English mocks: {existing}")
    
    # Delete old English mocks to regenerate fresh ones
    if existing > 0:
        print("Removing old English mocks to generate fresh comprehensive ones...")
        old_mocks = await db.mock_tests.find({"subject": "English"}, {"id": 1}).to_list(100)
        old_ids = [m["id"] for m in old_mocks]
        await db.mock_tests.delete_many({"subject": "English"})
        await db.questions.delete_many({"subject": "English"})
        print(f"Deleted {len(old_ids)} old English mocks")
    
    # Generate 20 new mocks
    total_questions = 0
    for mock_num in range(1, 21):
        try:
            mock = await generate_mock_test(mock_num, client)
            total_questions += mock["total_questions"]
            
            # Rate limiting - wait between mocks
            if mock_num < 20:
                print(f"\n  Waiting 5 seconds before next mock...")
                await asyncio.sleep(5)
                
        except Exception as e:
            print(f"\n  ❌ Error generating mock {mock_num}: {e}")
            continue
    
    # Final summary
    final_count = await db.mock_tests.count_documents({"subject": "English"})
    final_questions = await db.questions.count_documents({"subject": "English"})
    
    print("\n" + "="*60)
    print("GENERATION COMPLETE!")
    print("="*60)
    print(f"Total English Mocks: {final_count}")
    print(f"Total Questions: {final_questions}")
    print("="*60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
