"""Quick script to create sample mock tests for all subjects."""
import os
import sys
sys.path.insert(0, '/app/backend')

from pymongo import MongoClient
from datetime import datetime
import uuid

# Connect to MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_mock_platform')

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# All subjects
SUBJECTS = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "History", "Political Science", "Geography", "Economics",
    "Business Studies", "Accountancy", "Psychology", "Computer Science",
    "English", "General Aptitude Test"
]

def generate_sample_questions(subject, num_questions=50):
    """Generate sample questions for a subject."""
    questions = []
    topics = {
        "Mathematics": ["Algebra", "Calculus", "Geometry", "Statistics", "Trigonometry"],
        "Physics": ["Mechanics", "Thermodynamics", "Optics", "Electricity", "Modern Physics"],
        "Chemistry": ["Organic", "Inorganic", "Physical Chemistry", "Biochemistry"],
        "Biology": ["Botany", "Zoology", "Genetics", "Ecology", "Human Physiology"],
        "History": ["Ancient India", "Medieval India", "Modern India", "World History"],
        "Political Science": ["Constitution", "Governance", "International Relations", "Political Theory"],
        "Geography": ["Physical Geography", "Human Geography", "Indian Geography", "World Geography"],
        "Economics": ["Microeconomics", "Macroeconomics", "Indian Economy", "Statistics"],
        "Business Studies": ["Management", "Marketing", "Finance", "Business Environment"],
        "Accountancy": ["Financial Accounting", "Cost Accounting", "Corporate Accounting"],
        "Psychology": ["Cognitive Psychology", "Social Psychology", "Developmental Psychology"],
        "Computer Science": ["Programming", "Data Structures", "DBMS", "Networking"],
        "English": ["Reading Comprehension", "Grammar", "Vocabulary", "Writing"],
        "General Aptitude Test": ["Logical Reasoning", "Quantitative Aptitude", "Verbal Ability"]
    }
    
    subject_topics = topics.get(subject, ["General"])
    
    for i in range(num_questions):
        topic = subject_topics[i % len(subject_topics)]
        q = {
            "id": str(uuid.uuid4()),
            "subject": subject,
            "topic": topic,
            "difficulty": ["easy", "medium", "hard"][i % 3],
            "question_text": f"{subject} Question {i+1}: This is a sample question about {topic}. What is the correct answer?",
            "options": [
                {"id": "A", "text": f"Option A for question {i+1}"},
                {"id": "B", "text": f"Option B for question {i+1}"},
                {"id": "C", "text": f"Option C for question {i+1} (Correct)"},
                {"id": "D", "text": f"Option D for question {i+1}"}
            ],
            "correct_answer": "C",
            "explanation": f"The correct answer is C. This is a sample explanation for {topic} in {subject}.",
            "created_at": datetime.utcnow()
        }
        questions.append(q)
    
    return questions

def create_mock_test(subject, mock_number, questions):
    """Create a mock test document."""
    return {
        "id": str(uuid.uuid4()),
        "subject": subject,
        "title": f"{subject} - Mock Test {mock_number}",
        "description": f"Full-length mock test #{mock_number} for {subject}",
        "total_questions": len(questions),
        "duration_minutes": 60,
        "difficulty": "medium",
        "question_ids": [q["id"] for q in questions],
        "questions": questions,
        "is_free_mock": mock_number == 1,  # First mock is free
        "question_generation_status": "completed",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

def main():
    print("Creating sample mocks for all subjects...")
    
    # Clear existing data
    db.mock_tests.delete_many({})
    db.questions.delete_many({})
    print("Cleared existing mocks and questions")
    
    total_mocks = 0
    total_questions = 0
    
    for subject in SUBJECTS:
        print(f"\nCreating mocks for {subject}...")
        
        # Create 3 mocks per subject (quick version)
        for mock_num in range(1, 4):
            questions = generate_sample_questions(subject, 50)
            mock = create_mock_test(subject, mock_num, questions)
            
            # Insert mock
            db.mock_tests.insert_one(mock)
            
            # Insert questions separately too
            for q in questions:
                q["mock_test_id"] = mock["id"]
            db.questions.insert_many(questions)
            
            total_mocks += 1
            total_questions += len(questions)
        
        print(f"  Created 3 mocks for {subject}")
    
    print(f"\n✅ Done! Created {total_mocks} mocks with {total_questions} questions")
    
    # Verify
    count = db.mock_tests.count_documents({})
    print(f"Verification: {count} mocks in database")

if __name__ == "__main__":
    main()
