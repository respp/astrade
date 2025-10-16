#!/usr/bin/env python3
"""
Test script for X10 Account Generation from Zero

This script demonstrates how to use the new X10 account generation endpoint
that creates accounts without requiring any input Ethereum private key.
"""

import asyncio
import httpx
import json

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust to your backend URL
TEST_USER_ID = "test_user_generation_12345"  # Replace with actual user ID

async def test_x10_account_generation():
    """Test the X10 account generation endpoint"""
    
    print(f"\n🚀 Testing X10 Account Generation from Zero...")
    print(f"User ID: {TEST_USER_ID}")
    print(f"Endpoint: POST /api/v1/users/{TEST_USER_ID}/x10/generate-account")
    
    # Prepare request data (minimal - only user_id needed)
    generation_data = {
        "user_id": TEST_USER_ID
    }
    
    print(f"\n📡 Request Data:")
    print(f"   {json.dumps(generation_data, indent=2)}")
    
    async with httpx.AsyncClient() as client:
        try:
            # Test X10 account generation
            print(f"\n📡 Calling X10 account generation endpoint...")
            response = await client.post(
                f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/x10/generate-account",
                json=generation_data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print(f"\n✅ X10 Account Generation Successful!")
                    
                    generated_account = result.get("generated_account", {})
                    print(f"\n🔑 Generated Account Details:")
                    print(f"   ETH Address: {generated_account.get('eth_address')}")
                    print(f"   ETH Private Key: {generated_account.get('eth_private_key', '')[:20]}...")
                    print(f"   L2 Vault: {generated_account.get('l2_vault')}")
                    print(f"   L2 Public Key: {generated_account.get('l2_public_key', '')[:20]}...")
                    print(f"   L2 Private Key: {generated_account.get('l2_private_key', '')[:20]}...")
                    print(f"   API Key: {generated_account.get('api_key')}")
                    print(f"   Claim ID: {generated_account.get('claim_id')}")
                    print(f"   Environment: {generated_account.get('environment')}")
                    print(f"   Generated from Zero: {generated_account.get('generated_from_zero')}")
                    
                    print(f"\n📋 Next Steps:")
                    for step in result.get('next_steps', []):
                        print(f"   {step}")
                    
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
                    print(f"\n❌ X10 Account Generation Failed")
                    print(f"Error: {result.get('message')}")
                    print(f"Next Steps: {result.get('next_steps', [])}")
            else:
                print(f"\n❌ HTTP Error: {response.status_code}")
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"\n💥 Exception during test: {str(e)}")
            print(f"Error Type: {type(e).__name__}")

async def test_multiple_account_generation():
    """Test generating multiple accounts for different users"""
    
    print(f"\n🔄 Testing Multiple Account Generation...")
    
    test_users = [
        "test_user_1",
        "test_user_2", 
        "test_user_3"
    ]
    
    async with httpx.AsyncClient() as client:
        for user_id in test_users:
            print(f"\n👤 Generating account for user: {user_id}")
            
            generation_data = {"user_id": user_id}
            
            try:
                response = await client.post(
                    f"{BASE_URL}/api/v1/users/{user_id}/x10/generate-account",
                    json=generation_data,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        account = result.get("generated_account", {})
                        print(f"   ✅ Success: {account.get('eth_address')}")
                    else:
                        print(f"   ❌ Failed: {result.get('message')}")
                else:
                    print(f"   ❌ HTTP Error: {response.status_code}")
                    
            except Exception as e:
                print(f"   💥 Exception: {str(e)}")

def print_usage_examples():
    """Print usage examples for the new API"""
    
    print("""
🎯 X10 Account Generation from Zero - API Usage Examples

1. Generate New X10 Account (No Input Required):
   POST /api/v1/users/{user_id}/x10/generate-account
   
   Request Body:
   {
     "user_id": "your_user_id"
   }
   
   Response:
   {
     "success": true,
     "generated_account": {
       "eth_address": "0x1234567890abcdef1234567890abcdef12345678",
       "eth_private_key": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
       "l2_vault": "123456",
       "l2_public_key": "0xabcdef...",
       "l2_private_key": "0x123456...",
       "api_key": "trading_key_123",
       "claim_id": "claim_456",
       "environment": "testnet",
       "generated_from_zero": true
     },
     "message": "New X10 perpetual trading account generated successfully",
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

📋 What the account generation does:
1. ✅ Generates new Ethereum account automatically
2. ✅ Onboards to X10 perpetual trading platform
3. ✅ Creates trading API key
4. ✅ Claims testnet funds
5. ✅ Stores all credentials in Supabase vault

🔒 Security Features:
- Private keys are generated securely
- All credentials stored encrypted in Supabase vault
- Response includes full private key for new accounts
- Status endpoint masks sensitive information

⚠️  Important Notes:
- No input required - everything is generated automatically
- Save the returned private key securely
- Use testnet environment for development
- Each call generates a completely new account
- Perfect for new users who don't have existing wallets

🆚 Comparison with Onboarding Endpoint:
- Onboarding: Requires existing ETH private key
- Generation: Creates everything from zero automatically
- Both store credentials in Supabase vault
- Both provide full X10 trading capabilities
""")

if __name__ == "__main__":
    print("🧪 X10 Account Generation from Zero - Test Suite")
    print("=" * 60)
    
    # Print usage examples
    print_usage_examples()
    
    print("\n" + "=" * 60)
    print("🧪 Running Tests...")
    
    # Test single account generation
    asyncio.run(test_x10_account_generation())
    
    # Test multiple account generation
    asyncio.run(test_multiple_account_generation())
    
    print("\n✅ Test suite completed!")
    print("\n💡 Key Benefits of Account Generation:")
    print("   - No need for users to have existing Ethereum wallets")
    print("   - Completely automated account creation")
    print("   - Perfect for onboarding new users")
    print("   - All credentials managed securely")
    print("   - Ready to trade immediately after generation")

