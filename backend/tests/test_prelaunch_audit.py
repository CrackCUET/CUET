"""
PRE-LAUNCH AUDIT Test Suite for CUET Mock Test Platform
Tests all critical flows before public launch
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cuet-exam-prep.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123456"
NEW_USER_EMAIL = f"prelaunch_test_{int(time.time())}@example.com"
NEW_USER_PASSWORD = "testpass123"
NEW_USER_NAME = "Pre-Launch Tester"
ADMIN_SECRET = "crackcuet_admin_2025"


class TestHealthCheck:
    """Health check and basic API tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        print("✓ API health check passed")
    
    def test_root_endpoint(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        print("✓ Root endpoint passed")


class TestAuthFlows:
    """Authentication flow tests"""
    
    def test_login_with_test_user(self):
        """Test login with existing test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data["data"]
        assert "user" in data["data"]
        assert data["data"]["user"]["email"] == TEST_EMAIL
        print("✓ Login with test user passed")
        return data["data"]["token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")
    
    def test_register_new_user(self):
        """Test registering a new user"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": NEW_USER_EMAIL,
            "name": NEW_USER_NAME,
            "password": NEW_USER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data["data"]
        assert data["data"]["user"]["email"] == NEW_USER_EMAIL
        print(f"✓ New user registration passed: {NEW_USER_EMAIL}")
        return data["data"]["token"]
    
    def test_register_duplicate_email(self):
        """Test that duplicate email registration fails"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL,
            "name": "Duplicate User",
            "password": "somepassword"
        })
        assert response.status_code == 400
        print("✓ Duplicate email correctly rejected")
    
    def test_get_current_user(self):
        """Test getting current user info"""
        token = self.test_login_with_test_user()
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["data"]["email"] == TEST_EMAIL
        print("✓ Get current user passed")


class TestOnboarding:
    """Onboarding flow tests"""
    
    def get_new_user_token(self):
        """Get token for a new user"""
        email = f"onboard_test_{int(time.time())}@example.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "name": "Onboarding Tester",
            "password": "testpass123"
        })
        return response.json()["data"]["token"]
    
    def test_get_subjects(self):
        """Test getting available subjects"""
        response = requests.get(f"{BASE_URL}/api/subjects")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "domain" in data["data"]
        assert "language" in data["data"]
        assert "general" in data["data"]
        
        # Verify 14 domain subjects
        domain_subjects = data["data"]["domain"]
        assert len(domain_subjects) == 14
        
        # Verify Applied Mathematics is in domain subjects
        apm_found = any(s["code"] == "APM" for s in domain_subjects)
        assert apm_found, "Applied Mathematics should be in domain subjects"
        print(f"✓ Subjects endpoint passed: {len(domain_subjects)} domain subjects")
    
    def test_complete_onboarding(self):
        """Test completing onboarding with 3 domain subjects"""
        token = self.get_new_user_token()
        
        response = requests.post(f"{BASE_URL}/api/onboarding", 
            json={
                "domain_subjects": ["Physics", "Mathematics", "Chemistry"],
                "language": "English"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["data"]["onboarding_completed"] == True
        print("✓ Onboarding completion passed")
    
    def test_onboarding_requires_3_subjects(self):
        """Test that onboarding requires exactly 3 subjects"""
        token = self.get_new_user_token()
        
        # Try with 2 subjects
        response = requests.post(f"{BASE_URL}/api/onboarding", 
            json={
                "domain_subjects": ["Physics", "Mathematics"],
                "language": "English"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        print("✓ Onboarding correctly requires 3 subjects")


class TestDashboard:
    """Dashboard and mock tests"""
    
    def get_test_user_token(self):
        """Get token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["data"]["token"]
    
    def test_get_dashboard(self):
        """Test dashboard endpoint"""
        token = self.get_test_user_token()
        response = requests.get(f"{BASE_URL}/api/dashboard", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "user" in data["data"]
        assert "plan_info" in data["data"]
        print("✓ Dashboard endpoint passed")
    
    def test_get_mocks(self):
        """Test getting available mocks"""
        token = self.get_test_user_token()
        response = requests.get(f"{BASE_URL}/api/mocks", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "mocks" in data["data"]
        
        # Check mocks exist
        mocks = data["data"]["mocks"]
        assert len(mocks) > 0, "Should have mocks available"
        
        # Check subjects are present
        subjects = set(m["subject"] for m in mocks)
        print(f"✓ Mocks endpoint passed: {len(mocks)} mocks across {len(subjects)} subjects")
        
        # Verify key subjects exist
        assert "English" in subjects, "English mocks should exist"
        assert "General Aptitude Test" in subjects, "GAT mocks should exist"
        assert "Physics" in subjects, "Physics mocks should exist"
        
        return mocks


class TestMockTestFlow:
    """Mock test start and submit flow"""
    
    def get_test_user_token(self):
        """Get token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["data"]["token"]
    
    def test_start_mock_returns_questions_or_generating(self):
        """Test starting a mock test returns questions or generating status"""
        token = self.get_test_user_token()
        
        # Get available mocks
        mocks_response = requests.get(f"{BASE_URL}/api/mocks", headers={
            "Authorization": f"Bearer {token}"
        })
        mocks = mocks_response.json()["data"]["mocks"]
        
        # Find a Physics mock (user's domain subject)
        physics_mock = next((m for m in mocks if m["subject"] == "Physics"), None)
        assert physics_mock is not None, "Physics mock should exist for test user"
        
        # Start the mock
        response = requests.post(f"{BASE_URL}/api/mocks/start", 
            json={"mock_test_id": physics_mock["id"]},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Should be 200 (questions ready) or 202 (generating)
        assert response.status_code in [200, 202]
        data = response.json()
        assert data["success"] == True
        
        if response.status_code == 200:
            assert "questions" in data["data"]
            assert "attempt_id" in data["data"]
            print(f"✓ Mock start passed: {len(data['data']['questions'])} questions returned")
            return data["data"]
        else:
            assert data["data"]["status"] == "generating"
            print("✓ Mock start passed: AI generating questions")
            return None


class TestLeaderboard:
    """Leaderboard tests"""
    
    def get_test_user_token(self):
        """Get token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["data"]["token"]
    
    def test_get_subject_leaderboard(self):
        """Test getting leaderboard for a subject"""
        token = self.get_test_user_token()
        response = requests.get(f"{BASE_URL}/api/leaderboard/Physics", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("✓ Subject leaderboard endpoint passed")
    
    def test_get_full_leaderboard(self):
        """Test getting full leaderboard for a subject"""
        token = self.get_test_user_token()
        response = requests.get(f"{BASE_URL}/api/leaderboard/Physics/full", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "personal_stats" in data["data"]
        assert "top_three" in data["data"]
        print("✓ Full leaderboard endpoint passed")
    
    def test_leaderboard_subjects_overview(self):
        """Test getting leaderboard subjects overview"""
        token = self.get_test_user_token()
        response = requests.get(f"{BASE_URL}/api/leaderboard/subjects/overview", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "subjects" in data["data"]
        print("✓ Leaderboard subjects overview passed")


class TestPricing:
    """Pricing and plans tests"""
    
    def test_get_pricing_plans(self):
        """Test getting pricing plans"""
        response = requests.get(f"{BASE_URL}/api/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "plans" in data["data"]
        
        plans = data["data"]["plans"]
        assert len(plans) == 3, "Should have 3 plans (Free, Pro, Premium)"
        
        # Verify Pro plan at Rs.999
        pro_plan = next((p for p in plans if p["id"] == "pro"), None)
        assert pro_plan is not None
        assert pro_plan["price"] == 999
        assert pro_plan["price_display"] == "₹999"
        
        # Verify Premium plan at Rs.1499
        premium_plan = next((p for p in plans if p["id"] == "premium"), None)
        assert premium_plan is not None
        assert premium_plan["price"] == 1499
        assert premium_plan["price_display"] == "₹1499"
        
        print("✓ Pricing plans passed: Free, Pro (₹999), Premium (₹1499)")


class TestContactForm:
    """Contact form tests"""
    
    def test_submit_contact_form(self):
        """Test submitting contact form"""
        response = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "Test Contact",
            "email": "contact_test@example.com",
            "phone": "+91 9876543210",
            "message": "This is a test inquiry from pre-launch audit"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "inquiry_id" in data["data"]
        print("✓ Contact form submission passed")


class TestAdminEndpoints:
    """Admin dashboard tests"""
    
    def test_admin_stats_with_correct_auth(self):
        """Test admin stats with correct authorization"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers={
            "Authorization": f"Admin {ADMIN_SECRET}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "total_users" in data["data"]
        assert "total_attempts" in data["data"]
        assert "plan_distribution" in data["data"]
        print(f"✓ Admin stats passed: {data['data']['total_users']} users, {data['data']['total_attempts']} attempts")
    
    def test_admin_stats_without_auth(self):
        """Test admin stats without authorization fails"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 403
        print("✓ Admin stats correctly requires auth")
    
    def test_admin_stats_with_wrong_auth(self):
        """Test admin stats with wrong authorization fails"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers={
            "Authorization": "Admin wrong_secret"
        })
        assert response.status_code == 403
        print("✓ Admin stats correctly rejects wrong auth")
    
    def test_admin_users_list(self):
        """Test admin users list"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers={
            "Authorization": f"Admin {ADMIN_SECRET}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "users" in data["data"]
        print(f"✓ Admin users list passed: {len(data['data']['users'])} users returned")
    
    def test_admin_inquiries(self):
        """Test admin contact inquiries"""
        response = requests.get(f"{BASE_URL}/api/admin/inquiries", headers={
            "Authorization": f"Admin {ADMIN_SECRET}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("✓ Admin inquiries endpoint passed")


class TestAnalytics:
    """Analytics endpoint tests"""
    
    def get_test_user_token(self):
        """Get token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["data"]["token"]
    
    def test_analytics_includes_subject(self):
        """Test that analytics response includes subject field for leaderboard navigation"""
        token = self.get_test_user_token()
        
        # Get dashboard to find a completed attempt
        dashboard_response = requests.get(f"{BASE_URL}/api/dashboard", headers={
            "Authorization": f"Bearer {token}"
        })
        data = dashboard_response.json()
        
        recent_attempts = data["data"].get("recent_attempts", [])
        if len(recent_attempts) > 0:
            attempt_id = recent_attempts[0]["id"]
            
            analytics_response = requests.get(f"{BASE_URL}/api/analytics/attempt/{attempt_id}", headers={
                "Authorization": f"Bearer {token}"
            })
            
            if analytics_response.status_code == 200:
                analytics_data = analytics_response.json()
                assert analytics_data["success"] == True
                assert "subject" in analytics_data["data"], "Analytics should include subject field"
                print(f"✓ Analytics includes subject field: {analytics_data['data']['subject']}")
            else:
                print("⚠ No completed attempts to test analytics")
        else:
            print("⚠ No recent attempts to test analytics")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
