#!/usr/bin/env python3
"""
Test script for X10 Perpetual Trading Onboarding

This script demonstrates how to use the new X10 onboarding endpoint.
"""

import asyncio
import httpx
import json
from eth_account import Account

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust to your backend URL
TEST_USER_ID = "test_user_12345"  # Replace with actual user ID

# Generate a test Ethereum private key (for testing only - use your own in production)
def generate_test_eth_key():
    """Generate a test Ethereum private key"""
    account = Account.create()
    return account.key.hex()

async def test_x10_onboarding():
    """Test the X10 onboarding endpoint"""
    
    # Generate test private key
    eth_private_key = generate_test_eth_key()
    print(f"Generated test ETH private key: {eth_private_key[:20]}...")
    
    # Prepare request data
    onboarding_data = {
        "eth_private_key": eth_private_key,
        "user_id": TEST_USER_ID
    }
    
    print(f"\n🚀 Testing X10 Perpetual Trading Onboarding...")
    print(f"User ID: {TEST_USER_ID}")
    print(f"ETH Key: {eth_private_key[:20]}...")
    
    async with httpx.AsyncClient() as client:
        try:
            # Test X10 onboarding
            print(f"\n📡 Calling X10 onboarding endpoint...")
            response = await client.post(
                f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/x10/onboard",
                json=onboarding_data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print(f"\n✅ X10 Onboarding Successful!")
                    print(f"Account Data: {json.dumps(result.get('account_data', {}), indent=2)}")
                    print(f"Next Steps: {result.get('next_steps', [])}")
                    
                    # Test status endpoint
                    print(f"\n📊 Checking X10 status...")
                    status_response = await client.get(
                        f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/x10/status"
                    )
                    
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        print(f"X10 Status: {json.dumps(status_data, indent=2)}")
                    else:
                        print(f"Status check failed: {status_response.status_code}")
                        print(f"Error: {status_response.text}")
                        
                else:
                    print(f"\n❌ X10 Onboarding Failed")
                    print(f"Error: {result.get('message')}")
                    print(f"Next Steps: {result.get('next_steps', [])}")
            else:
                print(f"\n❌ HTTP Error: {response.status_code}")
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"\n💥 Exception during test: {str(e)}")
            print(f"Error Type: {type(e).__name__}")

async def test_with_real_eth_key():
    """Test with a real Ethereum private key (replace with your own)"""
    
    # Replace with your actual Ethereum private key
    REAL_ETH_PRIVATE_KEY = "YOUR_ETH_PRIVATE_KEY_HERE"
    
    if REAL_ETH_PRIVATE_KEY == "YOUR_ETH_PRIVATE_KEY_HERE":
        print("⚠️  Skipping real key test - please replace REAL_ETH_PRIVATE_KEY with your actual key")
        return
    
    print(f"\n🔑 Testing with real Ethereum private key...")
    
    onboarding_data = {
        "eth_private_key": REAL_ETH_PRIVATE_KEY,
        "user_id": TEST_USER_ID
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/x10/onboard",
                json=onboarding_data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Real Key Test Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            
        except Exception as e:
            print(f"Real key test error: {str(e)}")

def print_usage_examples():
    """Print usage examples for the API"""
    
    print("""
🎯 X10 Perpetual Trading Onboarding API Usage Examples

1. Onboard to X10 Perpetual Trading:
   POST /api/v1/users/{user_id}/x10/onboard
   
   Request Body:
   {
     "eth_private_key": "0x1234567890abcdef...",
     "user_id": "your_user_id"
   }
   
   Response:
   {
     "success": true,
     "account_data": {
       "l2_vault": "123456",
       "l2_public_key": "0xabcdef...",
       "api_key": "trading_key_123",
       "eth_address": "0x1234...",
       "claim_id": "claim_456",
       "environment": "testnet"
     },
     "message": "X10 perpetual trading account created successfully",
     "setup_completed": true,
     "next_steps": [...]
   }

2. Check X10 Status:
   GET /api/v1/users/{user_id}/x10/status
   
   Response:
   {
     "success": true,
     "data": {
       "user_id": "your_user_id",
       "x10_configured": true,
       "account_details": {...},
       "trading_capabilities": {...},
       "status": "Active and ready for trading"
     }
   }

📋 What the onboarding does:
1. Creates Ethereum account from private key
2. Onboards to X10 perpetual trading platform
3. Creates trading API key
4. Claims testnet funds
5. Stores all credentials in Supabase vault

🔒 Security Features:
- Private keys are stored securely in Supabase vault
- Response data masks sensitive information
- All credentials are encrypted at rest

⚠️  Important Notes:
- Use testnet environment for development
- Keep your Ethereum private key secure
- Test with small amounts first
- Replace test keys with real keys in production
""")

if __name__ == "__main__":
    print("🧪 X10 Perpetual Trading Onboarding Test Suite")
    print("=" * 50)
    
    # Print usage examples
    print_usage_examples()
    
    # Run tests
    print("\n" + "=" * 50)
    print("🧪 Running Tests...")
    
    # Test with generated key
    asyncio.run(test_x10_onboarding())
    
    # Test with real key (if provided)
    asyncio.run(test_with_real_eth_key())
    
    print("\n✅ Test suite completed!")

