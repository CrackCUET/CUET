"""
CUET Mock Test Platform - Backend API Tests
Tests pricing plans, authentication, and dashboard features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cuet-exam-prep.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123456"


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_check(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "database" in data
        print(f"✅ Health check passed: {data}")


class TestPricingPlans:
    """Pricing plans endpoint tests - 3-tier model (Free, Pro, Premium)"""
    
    def test_pricing_plans_endpoint(self):
        """Test /api/pricing/plans returns correct plan data"""
        response = requests.get(f"{BASE_URL}/api/pricing/plans")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "plans" in data["data"]
        
        plans = data["data"]["plans"]
        assert len(plans) == 3, f"Expected 3 plans, got {len(plans)}"
        print(f"✅ Pricing endpoint returns {len(plans)} plans")
    
    def test_free_plan_details(self):
        """Test Free plan has correct pricing and features"""
        response = requests.get(f"{BASE_URL}/api/pricing/plans")
        assert response.status_code == 200
        
        plans = response.json()["data"]["plans"]
        free_plan = next((p for p in plans if p["id"] == "free"), None)
        
        assert free_plan is not None, "Free plan not found"
        assert free_plan["price"] == 0, f"Free plan price should be 0, got {free_plan['price']}"
        assert free_plan["price_display"] == "₹0", f"Free plan display should be ₹0, got {free_plan['price_display']}"
        assert free_plan["period"] == "forever"
        assert free_plan["limits"]["mocks_per_subject"] == 1
        assert free_plan["limits"]["type"] == "lifetime"
        print(f"✅ Free plan: {free_plan['price_display']} {free_plan['period']}")
    
    def test_pro_plan_details(self):
        """Test Pro plan has correct pricing (₹999/month) and features"""
        response = requests.get(f"{BASE_URL}/api/pricing/plans")
        assert response.status_code == 200
        
        plans = response.json()["data"]["plans"]
        pro_plan = next((p for p in plans if p["id"] == "pro"), None)
        
        assert pro_plan is not None, "Pro plan not found"
        assert pro_plan["price"] == 999, f"Pro plan price should be 999, got {pro_plan['price']}"
        assert pro_plan["price_display"] == "₹999", f"Pro plan display should be ₹999, got {pro_plan['price_display']}"
        assert pro_plan["period"] == "/month"
        assert pro_plan["limits"]["mocks_per_subject"] == 8
        assert pro_plan["popular"] == True, "Pro plan should be marked as popular"
        print(f"✅ Pro plan: {pro_plan['price_display']}{pro_plan['period']} - {pro_plan['limits']['mocks_per_subject']} mocks/subject/month")
    
    def test_premium_plan_details(self):
        """Test Premium plan has correct pricing (₹1499/month) and features"""
        response = requests.get(f"{BASE_URL}/api/pricing/plans")
        assert response.status_code == 200
        
        plans = response.json()["data"]["plans"]
        premium_plan = next((p for p in plans if p["id"] == "premium"), None)
        
        assert premium_plan is not None, "Premium plan not found"
        assert premium_plan["price"] == 1499, f"Premium plan price should be 1499, got {premium_plan['price']}"
        assert premium_plan["price_display"] == "₹1499", f"Premium plan display should be ₹1499, got {premium_plan['price_display']}"
        assert premium_plan["period"] == "/month"
        assert premium_plan["limits"]["mocks_per_subject"] == 10
        print(f"✅ Premium plan: {premium_plan['price_display']}{premium_plan['period']} - {premium_plan['limits']['mocks_per_subject']} mocks/subject/month")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "token" in data["data"]
        assert "user" in data["data"]
        assert data["data"]["user"]["email"] == TEST_EMAIL
        print(f"✅ Login successful for {TEST_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@example.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✅ Invalid login correctly returns 401")
    
    def test_user_plan_is_pro(self):
        """Test that test user has Pro plan"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        
        user = response.json()["data"]["user"]
        assert user["plan"] == "pro", f"Expected Pro plan, got {user['plan']}"
        print(f"✅ User plan is: {user['plan']}")


class TestDashboard:
    """Dashboard endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["data"]["token"]
        pytest.skip("Authentication failed")
    
    def test_dashboard_requires_auth(self):
        """Test dashboard endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Dashboard correctly requires authentication")
    
    def test_dashboard_returns_user_data(self, auth_token):
        """Test dashboard returns user data and plan info"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "user" in data["data"]
        assert "plan_info" in data["data"]
        
        plan_info = data["data"]["plan_info"]
        assert "plan" in plan_info
        assert plan_info["plan"] == "pro"
        print(f"✅ Dashboard returns correct plan info: {plan_info['plan']}")


class TestMocksEndpoint:
    """Mock tests endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["data"]["token"]
        pytest.skip("Authentication failed")
    
    def test_mocks_endpoint(self, auth_token):
        """Test mocks endpoint returns available mock tests"""
        response = requests.get(
            f"{BASE_URL}/api/mocks",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "mocks" in data["data"]
        assert "plan" in data["data"]
        
        mocks = data["data"]["mocks"]
        assert len(mocks) > 0, "Expected at least one mock test"
        print(f"✅ Mocks endpoint returns {len(mocks)} mock tests")


class TestSubjectsEndpoint:
    """Subjects endpoint tests"""
    
    def test_subjects_endpoint(self):
        """Test subjects endpoint returns CUET subjects"""
        response = requests.get(f"{BASE_URL}/api/subjects")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "domain" in data["data"]
        assert "language" in data["data"]
        assert "general" in data["data"]
        
        # Verify domain subjects exist
        domain_subjects = [s["name"] for s in data["data"]["domain"]]
        assert "Physics" in domain_subjects
        assert "Chemistry" in domain_subjects
        assert "Mathematics" in domain_subjects
        print(f"✅ Subjects endpoint returns {len(domain_subjects)} domain subjects")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
