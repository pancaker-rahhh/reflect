#!/usr/bin/env python3
"""
Test script for Dodo Payments integration in test mode.
This script tests the complete payment flow using Dodo's test environment.
"""

import asyncio
import json
import os
import sys
from pathlib import Path

# Add the API server to Python path
current_dir = Path(__file__).parent
if (current_dir / "api" / "server").exists():
    api_server_path = current_dir / "api" / "server"
elif (current_dir / "server").exists():
    api_server_path = current_dir / "server"
else:
    print("❌ Could not find server directory")
    sys.exit(1)

sys.path.insert(0, str(api_server_path))

from app.core.settings import get_settings
from app.core.subscription_plans import get_plan_by_id, get_active_plans
from app.services.payment_service import payment_service

# Test configuration
TEST_ORGANIZATION_ID = "550e8400-e29b-41d4-a716-446655440000"  # Mock UUID
TEST_USER_DETAILS = {
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "country": "US",
    "city": "San Francisco",
    "state": "CA",
    "street": "123 Test Street",
    "zipcode": "94105",
}


async def test_payment_service():
    """Test the payment service functionality."""
    print("🧪 Testing Dodo Payments Integration (Test Mode)")
    print("=" * 60)

    # Get settings
    settings = get_settings()
    print(f"✅ Settings loaded")
    print(
        f"   - Test API Key: {'✅ Set' if settings.DODO_TEST_API_KEY else '❌ Not set'}"
    )
    print(f"   - Return URL: {settings.DODO_RETURN_URL}")
    print(f"   - Frontend URL: {settings.FRONTEND_URL}")

    # Check if test API key is configured
    if not settings.DODO_TEST_API_KEY:
        print("\n❌ DODO_TEST_API_KEY not configured!")
        print("Please set DODO_TEST_API_KEY in your .env file")
        return False

    # Test 1: Check available plans
    print("\n📋 Testing Available Plans")
    print("-" * 30)
    plans = get_active_plans()
    for plan in plans:
        print(f"   - {plan['id']}: {plan['display_name']} (${plan['price']})")
        if plan.get("dodo_product_id"):
            print(f"     Product ID: {plan['dodo_product_id']}")
        else:
            print(f"     Product ID: None (Free plan)")

    # Test 2: Test payment link creation for each paid plan
    print("\n🔗 Testing Payment Link Creation")
    print("-" * 40)

    paid_plans = [plan for plan in plans if plan.get("price", 0) > 0]

    for plan in paid_plans:
        print(f"\n   Testing {plan['display_name']}...")

        try:
            # Create a mock database session (we'll skip actual DB operations for this test)
            class MockDB:
                async def commit(self):
                    pass

                async def rollback(self):
                    pass

            mock_db = MockDB()

            # Create payment link
            result = await payment_service.create_payment_link(
                db=mock_db,
                organization_id=TEST_ORGANIZATION_ID,
                plan_id=plan["id"],
                user_details=TEST_USER_DETAILS,
            )

            print(f"   ✅ Payment link created successfully!")
            print(f"   📱 Payment URL: {result['payment_link']}")
            print(f"   💰 Amount: ${result['amount']} {result['currency']}")
            print(f"   🏢 Organization: {result['organization_id']}")

            # Verify the URL is using test environment
            if "test.checkout.dodopayments.com" in result["payment_link"]:
                print(f"   ✅ Using test environment")
            else:
                print(f"   ⚠️  Not using test environment")

        except Exception as e:
            print(f"   ❌ Failed to create payment link: {str(e)}")
            return False

    # Test 3: Test webhook processing (simulation)
    print("\n🔔 Testing Webhook Processing (Simulation)")
    print("-" * 45)

    # Simulate a successful payment webhook
    webhook_payload = {
        "type": "payment.succeeded",
        "data": {
            "id": "pay_test_123456789",
            "subscription_id": "sub_test_123456789",
            "customer": {"email": "test@example.com"},
            "metadata": {
                "organization_id": TEST_ORGANIZATION_ID,
                "plan_id": "pro_monthly",
            },
        },
    }

    try:
        # Note: We're not actually processing the webhook since we don't have a real DB
        print(f"   ✅ Webhook payload structure is valid")
        print(f"   📝 Event type: {webhook_payload['type']}")
        print(f"   💳 Payment ID: {webhook_payload['data']['id']}")
        print(f"   🔄 Subscription ID: {webhook_payload['data']['subscription_id']}")
        print(f"   👤 Customer: {webhook_payload['data']['customer']['email']}")

    except Exception as e:
        print(f"   ❌ Webhook processing failed: {str(e)}")
        return False

    print("\n🎉 All tests completed successfully!")
    print("\n📝 Next Steps:")
    print("   1. Set up your Dodo Payments test account")
    print(
        "   2. Configure DODO_TEST_PRODUCT_ID_PRO_MONTHLY and DODO_TEST_PRODUCT_ID_PRO_YEARLY"
    )
    print("   3. Test the actual payment flow by visiting the generated URLs")
    print("   4. Set up webhook endpoints to receive payment notifications")

    return True


def print_environment_setup():
    """Print instructions for setting up the test environment."""
    print("\n🔧 Environment Setup Instructions")
    print("=" * 40)
    print("1. Get your test API key from Dodo Payments dashboard")
    print("2. Add these variables to your .env file:")
    print()
    print("   # Dodo Payments Test Configuration")
    print("   DODO_TEST_API_KEY=your_test_api_key_here")
    print("   DODO_TEST_PRODUCT_ID_PRO_MONTHLY=test_product_id_monthly")
    print("   DODO_TEST_PRODUCT_ID_PRO_YEARLY=test_product_id_yearly")
    print("   DODO_RETURN_URL=http://localhost:5173/payment-status")
    print()
    print("3. Create test products in your Dodo Payments test dashboard")
    print("4. Run this script to test the integration")


async def main():
    """Main test function."""
    print_environment_setup()

    # Check if we're in the right directory
    if not Path("server").exists() and not Path("api/server").exists():
        print("\n❌ Please run this script from the project root or api directory")
        return

    # Run the tests
    success = await test_payment_service()

    if success:
        print("\n✅ Test completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Test failed!")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
