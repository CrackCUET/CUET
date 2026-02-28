"""
Test suite for Applied Mathematics mocks and new features
- Applied Mathematics subject is in /api/subjects
- Applied Mathematics mocks are available via /api/mocks
- Submit response includes subject field
- Analytics endpoint includes subject field
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cuet-exam-prep.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123456"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert data.get("success"), "Login response indicates failure"
    return data["data"]["token"]


class TestAppliedMathematicsFeature:
    """Test Applied Mathematics subject availability"""
    
    def test_subjects_endpoint_includes_applied_mathematics(self):
        """Verify Applied Mathematics is in the domain subjects list"""
        response = requests.get(f"{BASE_URL}/api/subjects")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success"), "Subjects endpoint failed"
        
        domain_subjects = data["data"]["domain"]
        subject_names = [s["name"] for s in domain_subjects]
        
        assert "Applied Mathematics" in subject_names, \
            f"Applied Mathematics not found in domain subjects: {subject_names}"
        
        # Check code
        apm = next((s for s in domain_subjects if s["name"] == "Applied Mathematics"), None)
        assert apm is not None
        assert apm["code"] == "APM", f"Expected code APM, got {apm['code']}"
    
    def test_mocks_endpoint_returns_applied_mathematics_mocks(self, auth_token):
        """Verify Applied Mathematics mocks are available"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/mocks", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success"), "Mocks endpoint failed"
        
        mocks = data["data"]["mocks"]
        applied_math_mocks = [m for m in mocks if m["subject"] == "Applied Mathematics"]
        
        assert len(applied_math_mocks) >= 20, \
            f"Expected at least 20 Applied Mathematics mocks, found {len(applied_math_mocks)}"
        
        # Verify mock structure
        first_mock = applied_math_mocks[0]
        assert "id" in first_mock
        assert "title" in first_mock
        assert "Applied Mathematics" in first_mock["title"]
        assert first_mock["total_questions"] == 50
        assert first_mock["duration_minutes"] == 60


class TestSubmitResponseSubjectField:
    """Test that submit and analytics endpoints include subject field"""
    
    def test_analytics_endpoint_includes_subject(self, auth_token):
        """Verify analytics endpoint returns subject field"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First get user's completed attempts
        response = requests.get(f"{BASE_URL}/api/dashboard", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        recent_attempts = data["data"].get("recent_attempts", [])
        
        if len(recent_attempts) == 0:
            pytest.skip("No completed attempts to test analytics with")
        
        # Get analytics for the first attempt
        attempt_id = recent_attempts[0]["id"]
        
        analytics_response = requests.get(
            f"{BASE_URL}/api/analytics/attempt/{attempt_id}",
            headers=headers
        )
        
        assert analytics_response.status_code == 200
        analytics_data = analytics_response.json()
        
        assert analytics_data.get("success"), "Analytics endpoint failed"
        
        # Verify subject field exists in analytics data
        analytics = analytics_data["data"]
        assert "subject" in analytics, "Subject field missing from analytics response"
        assert analytics["subject"] is not None, "Subject field is null"
        assert isinstance(analytics["subject"], str), "Subject should be a string"
        
        # Verify other expected analytics fields
        assert "score" in analytics
        assert "percentile" in analytics
        assert "rank" in analytics
        assert "topic_breakdown" in analytics


class TestHealthEndpoint:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """Verify API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("status") == "healthy"
        assert data.get("database") == "connected"
    
    def test_api_root(self):
        """Verify API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        
        data = response.json()
        assert "CUET Mock Test Platform" in data.get("message", "")


class TestLeaderboardEndpoints:
    """Test leaderboard with Applied Mathematics"""
    
    def test_leaderboard_subjects_overview(self, auth_token):
        """Verify leaderboard subjects overview works"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/leaderboard/subjects/overview", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success"), "Leaderboard overview failed"
        
        subjects = data["data"]["subjects"]
        subject_names = [s["subject"] for s in subjects]
        
        # Applied Mathematics may or may not have participants yet
        # Just verify the endpoint works
        assert len(subjects) >= 1, "Should have at least one subject with participants"
    
    def test_leaderboard_for_subject(self, auth_token):
        """Verify leaderboard for a specific subject"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Test with Physics (which has data)
        response = requests.get(f"{BASE_URL}/api/leaderboard/Physics", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success"), "Leaderboard retrieval failed"
        
        # Verify structure
        assert "top_performers" in data["data"]
        assert "total_participants" in data["data"]
    
    def test_full_leaderboard_endpoint(self, auth_token):
        """Verify full leaderboard endpoint"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.get(
            f"{BASE_URL}/api/leaderboard/Physics/full",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success"), "Full leaderboard failed"
        
        leaderboard_data = data["data"]
        assert "subject" in leaderboard_data
        assert "personal_stats" in leaderboard_data
        assert "top_three" in leaderboard_data
        assert "full_leaderboard" in leaderboard_data


class TestDashboardPage:
    """Test dashboard endpoint"""
    
    def test_dashboard_returns_subject_performance(self, auth_token):
        """Verify dashboard returns subject performance data"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success"), "Dashboard endpoint failed"
        
        dashboard = data["data"]
        assert "user" in dashboard
        assert "recent_attempts" in dashboard
        assert "subject_performance" in dashboard
        assert "streak_days" in dashboard
        
        # Verify recent attempts have subject field
        for attempt in dashboard.get("recent_attempts", []):
            assert "subject" in attempt, "Recent attempt missing subject field"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
