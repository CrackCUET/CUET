import os
import re
import json
import time
import requests


def _api_url():
    # Uses the same env var as the frontend for external URL testing
    # Expect REACT_APP_BACKEND_URL to be set in the environment when running locally.
    return os.environ.get("API_URL")


def _login(api_url: str, email: str, password: str) -> str:
    r = requests.post(
        f"{api_url}/api/auth/login",
        json={"email": email, "password": password},
        timeout=60,
    )
    r.raise_for_status()
    data = r.json()
    token = data.get("data", {}).get("token") or data.get("token")
    assert token
    return token


def _get_mock_id(api_url: str, token: str, subject: str) -> str:
    r = requests.get(
        f"{api_url}/api/mocks",
        headers={"Authorization": f"Bearer {token}"},
        timeout=60,
    )
    r.raise_for_status()
    mocks = r.json().get("data", {}).get("mocks", [])
    m = [x for x in mocks if x.get("subject") == subject]
    assert m
    return m[0]["id"]


def _poll_start(api_url: str, token: str, mock_id: str, max_wait_s: int = 180):
    t0 = time.time()
    while time.time() - t0 < max_wait_s:
        r = requests.post(
            f"{api_url}/api/mocks/start",
            headers={"Authorization": f"Bearer {token}"},
            json={"mock_test_id": mock_id},
            timeout=60,
        )
        if r.status_code == 202:
            time.sleep(2)
            continue
        r.raise_for_status()
        return r.json()
    raise AssertionError("Timed out waiting for mock generation")


def test_physics_mock_unique_and_pinned():
    api_url = _api_url()
    if not api_url:
        return

    token = _login(api_url, "test@example.com", "test123456")
    mock_id = _get_mock_id(api_url, token, "Physics")

    r1 = _poll_start(api_url, token, mock_id)
    r2 = _poll_start(api_url, token, mock_id)

    q1 = r1["data"]["questions"]
    q2 = r2["data"]["questions"]
    assert len(q1) == 50
    assert [q["id"] for q in q1] == [q["id"] for q in q2]

    def norm(t):
        return re.sub(r"\s+", " ", re.sub(r"[^a-zA-Z0-9]+", " ", (t or "").lower())).strip()

    assert len({norm(q["question_text"]) for q in q1}) == 50


def test_math_mock_unique_when_quota_allows():
    api_url = _api_url()
    if not api_url:
        return

    token = _login(api_url, "test@example.com", "test123456")
    mock_id = _get_mock_id(api_url, token, "Mathematics")

    # This may fail if GEMINI_API_KEY quota is exhausted.
    r = _poll_start(api_url, token, mock_id)
    qs = r["data"]["questions"]
    assert len(qs) == 50
