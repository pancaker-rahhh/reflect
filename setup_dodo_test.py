#!/usr/bin/env python3
"""
Setup script for Dodo Payments test environment.
This script helps you configure the test environment variables.
"""

import os
from pathlib import Path


def setup_dodo_test_env():
    """Set up Dodo Payments test environment variables."""
    print("🔧 Dodo Payments Test Environment Setup")
    print("=" * 50)

    # Check if .env file exists
    env_file = Path("api/server/.env")
    if not env_file.exists():
        print("❌ .env file not found at api/server/.env")
        print("Please create the .env file first")
        return False

    print("✅ Found .env file")

    # Read current .env content
    with open(env_file, "r") as f:
        content = f.read()

    # Check if Dodo test variables are already set
    if "DODO_TEST_API_KEY" in content:
        print("⚠️  Dodo test variables already exist in .env file")
        print("Current Dodo test configuration:")
        for line in content.split("\n"):
            if line.startswith("DODO_TEST_") or line.startswith("DODO_RETURN_URL"):
                print(f"   {line}")

        response = input("\nDo you want to update them? (y/n): ")
        if response.lower() != "y":
            print("Skipping configuration update")
            return True

    print("\n📝 Please provide the following information:")
    print("(You can get these from your Dodo Payments test dashboard)")
    print()

    # Get test API key
    test_api_key = input("Dodo Test API Key: ").strip()
    if not test_api_key:
        print("❌ Test API key is required")
        return False

    # Get product IDs
    monthly_product_id = input("Monthly Product ID (e.g., pdt_xxxxx): ").strip()
    yearly_product_id = input("Yearly Product ID (e.g., pdt_xxxxx): ").strip()

    if not monthly_product_id or not yearly_product_id:
        print("❌ Both product IDs are required")
        return False

    # Get return URL
    return_url = input(
        "Return URL (default: http://localhost:5173/payment-status): "
    ).strip()
    if not return_url:
        return_url = "http://localhost:5173/payment-status"

    # Prepare new environment variables
    new_vars = f"""
# Dodo Payments Test Configuration
DODO_TEST_API_KEY={test_api_key}
DODO_TEST_PRODUCT_ID_PRO_MONTHLY={monthly_product_id}
DODO_TEST_PRODUCT_ID_PRO_YEARLY={yearly_product_id}
DODO_RETURN_URL={return_url}
"""

    # Update .env file
    if "DODO_TEST_API_KEY" in content:
        # Replace existing Dodo test configuration
        lines = content.split("\n")
        new_lines = []
        skip_until_empty = False

        for line in lines:
            if line.startswith("DODO_TEST_") or line.startswith("DODO_RETURN_URL"):
                if not skip_until_empty:
                    skip_until_empty = True
                    new_lines.append(new_vars.strip())
                continue
            elif skip_until_empty and line.strip() == "":
                skip_until_empty = False
                continue
            else:
                new_lines.append(line)

        new_content = "\n".join(new_lines)
    else:
        # Append new configuration
        new_content = content + new_vars

    # Write updated content
    with open(env_file, "w") as f:
        f.write(new_content)

    print("\n✅ Environment variables updated successfully!")
    print("\n📋 Configuration summary:")
    print(f"   Test API Key: {test_api_key[:10]}...")
    print(f"   Monthly Product ID: {monthly_product_id}")
    print(f"   Yearly Product ID: {yearly_product_id}")
    print(f"   Return URL: {return_url}")

    print("\n🚀 Next steps:")
    print("1. Run the test script: poetry run python ../test_dodo_payments.py")
    print("2. Test the frontend: http://localhost:5173/test-payment.html")
    print("3. Test actual payment flow with the generated URLs")

    return True


def main():
    """Main setup function."""
    # Check if we're in the right directory
    if not Path("api/server").exists():
        print("❌ Please run this script from the project root directory")
        return

    success = setup_dodo_test_env()

    if success:
        print("\n🎉 Setup completed successfully!")
    else:
        print("\n❌ Setup failed!")


if __name__ == "__main__":
    main()
