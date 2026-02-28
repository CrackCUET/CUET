"""Pre-generate and pin Psychology mocks (AI-generated questions) for reuse.

Usage:
  cd /app/backend && python scripts/pregenerate_psychology_mocks.py --count 20

Notes:
- Uses GEMINI_API_KEY (Google GenAI SDK) if present via QuestionGenerator.
- Creates/ensures mocks titled "Psychology - Mock Test N" for N=1..count
- Generates 50 questions per mock and pins question_ids.
"""

import argparse
import asyncio
import os
import re
from datetime import datetime

from dotenv import load_dotenv
from pymongo import MongoClient


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-zA-Z0-9]+", " ", (text or "").lower())).strip()


async def main(count: int):
    load_dotenv()

    from pathlib import Path

    env_path = Path(__file__).resolve().parents[1] / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v

    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    if not mongo_url or not db_name:
        raise RuntimeError("MONGO_URL/DB_NAME must be set")

    import sys
    sys.path.append(str(Path(__file__).resolve().parents[1]))
    from question_generator import QuestionGenerator
    from models import MockTest

    client = MongoClient(mongo_url)
    db = client[db_name]

    generator = QuestionGenerator()

    mocks = []
    for i in range(1, count + 1):
        title = f"Psychology - Mock Test {i}"
        mock = db.mock_tests.find_one({"subject": "Psychology", "title": title}, {"_id": 0})
        if not mock:
            m = MockTest(
                subject="Psychology",
                title=title,
                description=f"Full-length Psychology mock test with 50 questions (Set {i})",
                total_questions=50,
                total_marks=250,
                duration_minutes=60,
                question_generation_status="not_started",
            )
            db.mock_tests.insert_one(m.model_dump())
            mock = m.model_dump()
        mocks.append(mock)

    ready = 0
    for idx, mock in enumerate(mocks, start=1):
        mock_id = mock["id"]

        if mock.get("question_ids") and len(mock.get("question_ids", [])) >= 50 and mock.get("question_generation_status") == "ready":
            ready += 1
            print(f"[{idx}/{count}] SKIP ready: {mock['title']}")
            continue

        print(f"[{idx}/{count}] GENERATE: {mock['title']} (mock_id={mock_id})")
        import time
        t0 = time.time()

        db.mock_tests.update_one(
            {"id": mock_id},
            {"$set": {
                "question_ids": [],
                "question_generation_status": "in_progress",
                "question_generation_started_at": datetime.utcnow(),
                "question_generation_completed_at": None,
                "question_generation_error": None,
            }},
        )

        try:
            questions = []
            for _ in range(5):
                batch = await generator.generate_mock_test_questions(subject="Psychology", total_questions=10)
                questions.extend(batch)

            unique = []
            seen = set()
            for q in questions:
                n = _norm(q.question_text)
                if n in seen:
                    continue
                seen.add(n)
                unique.append(q)

            attempts = 0
            while len(unique) < 50 and attempts < 4:
                batch = await generator.generate_mock_test_questions(subject="Psychology", total_questions=10)
                for q in batch:
                    n = _norm(q.question_text)
                    if n in seen:
                        continue
                    seen.add(n)
                    unique.append(q)
                attempts += 1

            questions = unique

            if len(questions) < 50:
                raise RuntimeError(f"Only generated {len(questions)} questions")

            question_ids = []
            seen_norms = set()

            for q in questions:
                n = _norm(q.question_text)
                if n in seen_norms:
                    continue
                seen_norms.add(n)

                existing = db.questions.find_one(
                    {"question_text": q.question_text, "subject": "Psychology"},
                    {"_id": 0, "id": 1},
                )
                if existing:
                    qid = existing["id"]
                else:
                    db.questions.insert_one(q.model_dump())
                    qid = q.id

                question_ids.append(qid)
                if len(question_ids) >= 50:
                    break

            if len(question_ids) < 50:
                raise RuntimeError(f"After de-dup/insert, only pinned {len(question_ids)} questions")

            db.mock_tests.update_one(
                {"id": mock_id},
                {"$set": {
                    "question_ids": question_ids,
                    "question_generation_status": "ready",
                    "question_generation_completed_at": datetime.utcnow(),
                    "question_generation_error": None,
                }},
            )

            ready += 1
            print(f"[{idx}/{count}] DONE ready: {mock['title']} (pinned=50) elapsed={time.time()-t0:.1f}s")

        except Exception as e:
            db.mock_tests.update_one(
                {"id": mock_id},
                {"$set": {
                    "question_generation_status": "failed",
                    "question_generation_completed_at": datetime.utcnow(),
                    "question_generation_error": str(e),
                }},
            )
            print(f"[{idx}/{count}] FAILED: {mock['title']} -> {e}")

    print(f"\nSUMMARY: ready={ready}/{count}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=20)
    args = parser.parse_args()

    asyncio.run(main(args.count))
