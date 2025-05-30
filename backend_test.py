
import requests
import sys
import json
from datetime import datetime

class SmartSpendAPITester:
    def __init__(self, base_url="https://9fb2faca-af19-46df-a33d-77a607e236cf.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = {}

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = self.base_url + "/api/" + endpoint
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print("\n🔍 Testing {}...".format(name))
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print("✅ Passed - Status: {}".format(response.status_code))
                try:
                    response_data = response.json()
                    print("Response: {}...".format(json.dumps(response_data, indent=2)[:500]))
                except:
                    print("Response: {}...".format(response.text[:200]))
            else:
                print("❌ Failed - Expected {}, got {}".format(expected_status, response.status_code))
                print("Response: {}...".format(response.text[:200]))

            self.test_results[name] = {
                "success": success,
                "status_code": response.status_code,
                "expected_status": expected_status
            }

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print("❌ Failed - Error: {}".format(str(e)))
            self.test_results[name] = {
                "success": False,
                "error": str(e)
            }
            return False, {}

    def test_health_check(self):
        """Test API health check endpoint"""
        return self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )

    def test_create_expense(self, amount, category, description):
        """Test creating an expense"""
        return self.run_test(
            "Create Expense ({})".format(category),
            "POST",
            "expenses",
            200,
            data={
                "amount": amount,
                "category": category,
                "description": description
            }
        )

    def test_get_expenses(self):
        """Test getting all expenses"""
        return self.run_test(
            "Get All Expenses",
            "GET",
            "expenses",
            200
        )

    def test_get_dashboard(self):
        """Test getting dashboard data"""
        return self.run_test(
            "Get Dashboard Data",
            "GET",
            "dashboard",
            200
        )

    def test_create_goal(self, title, target_amount):
        """Test creating a savings goal"""
        return self.run_test(
            "Create Savings Goal",
            "POST",
            "goals",
            200,
            data={
                "title": title,
                "target_amount": target_amount
            }
        )

    def test_get_goals(self):
        """Test getting all goals"""
        return self.run_test(
            "Get All Goals",
            "GET",
            "goals",
            200
        )

    def test_get_analytics(self):
        """Test getting analytics data"""
        return self.run_test(
            "Get Analytics Data",
            "GET",
            "analytics",
            200
        )

def main():
    # Setup
    tester = SmartSpendAPITester()
    timestamp = datetime.now().strftime('%H%M%S')
    
    # Run tests
    print("\n===== TESTING SMARTSPEND API =====\n")
    
    # 1. Health check
    tester.test_health_check()
    
    # 2. Create expenses with different categories
    categories = ["Food", "Travel", "Shopping", "Entertainment", "Healthcare", "Bills", "Education", "Other"]
    for i, category in enumerate(categories):
        tester.test_create_expense(
            amount=100 + (i * 50),
            category=category,
            description="Test {} expense {}".format(category, timestamp)
        )
    
    # 3. Get all expenses
    tester.test_get_expenses()
    
    # 4. Get dashboard data
    tester.test_get_dashboard()
    
    # 5. Create a savings goal
    tester.test_create_goal(
        title="Test Goal {}".format(timestamp),
        target_amount=5000
    )
    
    # 6. Get all goals
    tester.test_get_goals()
    
    # 7. Get analytics data
    tester.test_get_analytics()
    
    # Print results
    print("\n===== TEST RESULTS =====")
    pass_percentage = 0
    if tester.tests_run > 0:
        pass_percentage = (tester.tests_passed/tester.tests_run*100)
    print("Tests passed: {}/{} ({:.1f}%)".format(tester.tests_passed, tester.tests_run, pass_percentage))
    
    # Print failed tests
    failed_tests = {name: details for name, details in tester.test_results.items() if not details.get("success")}
    if failed_tests:
        print("\nFailed tests:")
        for name, details in failed_tests.items():
            error_msg = details.get('error', 'Expected {}, got {}'.format(
                details.get('expected_status'), details.get('status_code')))
            print("- {}: {}".format(name, error_msg))
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
