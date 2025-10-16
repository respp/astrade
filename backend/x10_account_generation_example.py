#!/usr/bin/env python3
"""
X10 Account Generation Example

This script demonstrates the difference between:
1. X10 Onboarding (with existing ETH private key)
2. X10 Account Generation (from zero, no input required)
"""

import asyncio
from eth_account import Account

def print_comparison():
    """Print comparison between the two approaches"""
    
    print("""
🆚 X10 Account Creation Methods Comparison

┌─────────────────────────────────────────────────────────────────┐
│                    X10 ONBOARDING                              │
│              (With Existing ETH Private Key)                   │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Use existing Ethereum wallet                                │
│ ✅ User controls their own private key                         │
│ ✅ Can use hardware wallets, MetaMask, etc.                    │
│ ❌ Requires user to have existing wallet                       │
│ ❌ User must provide private key                               │
│ ❌ More complex for new users                                  │
│                                                                 │
│ Endpoint: POST /api/v1/users/{user_id}/x10/onboard             │
│ Input: {"eth_private_key": "0x...", "user_id": "..."}         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                X10 ACCOUNT GENERATION                          │
│                    (From Zero)                                 │
├─────────────────────────────────────────────────────────────────┤
│ ✅ No input required                                           │
│ ✅ Perfect for new users                                       │
│ ✅ Completely automated                                        │
│ ✅ Generates secure random keys                                │
│ ✅ Ready to use immediately                                    │
│ ❌ User doesn't control key generation                         │
│ ❌ Must trust system to generate keys                          │
│                                                                 │
│ Endpoint: POST /api/v1/users/{user_id}/x10/generate-account    │
│ Input: {"user_id": "..."}                                      │
└─────────────────────────────────────────────────────────────────┘

🎯 When to Use Each Method:

📱 X10 Onboarding (With ETH Key):
   - User has existing Ethereum wallet
   - User wants to use their own private key
   - Integration with existing DeFi ecosystem
   - User prefers self-custody

🆕 X10 Account Generation (From Zero):
   - New user without existing wallet
   - Simplified onboarding flow
   - Mobile app integration
   - Quick setup for testing
   - Enterprise/custodial solutions

🔒 Security Considerations:

X10 Onboarding:
   - User controls private key
   - Higher security for experienced users
   - Requires secure key management

X10 Account Generation:
   - System generates secure random keys
   - Keys stored encrypted in Supabase vault
   - Easier for beginners
   - Requires trust in system security
""")

async def demonstrate_key_generation():
    """Demonstrate how account generation works"""
    
    print("\n🔑 Demonstrating Account Generation Process:")
    print("=" * 50)
    
    # Step 1: Generate new Ethereum account
    print("1️⃣ Generating new Ethereum account...")
    eth_account = Account.create()
    
    print(f"   ✅ ETH Address: {eth_account.address}")
    print(f"   ✅ ETH Private Key: {eth_account.key.hex()[:20]}...")
    
    # Step 2: Show what would happen next
    print("\n2️⃣ What happens next in X10 Account Generation:")
    print("   🔄 Onboard to X10 perpetual trading platform")
    print("   🔑 Generate L2 Stark keys")
    print("   🎫 Create trading API key")
    print("   💰 Claim testnet funds")
    print("   💾 Store all credentials in Supabase vault")
    
    # Step 3: Show the complete account data structure
    print("\n3️⃣ Complete Account Data Structure:")
    account_data = {
        "eth_address": eth_account.address,
        "eth_private_key": eth_account.key.hex(),
        "l2_vault": "123456",  # Would be generated by X10
        "l2_public_key": "0xabcdef...",  # Would be generated by X10
        "l2_private_key": "0x123456...",  # Would be generated by X10
        "api_key": "trading_key_123",  # Would be generated by X10
        "claim_id": "claim_456",  # Would be generated by X10
        "environment": "testnet",
        "generated_from_zero": True
    }
    
    for key, value in account_data.items():
        if key == "eth_private_key" or key == "l2_private_key":
            print(f"   {key}: {str(value)[:20]}...")
        else:
            print(f"   {key}: {value}")
    
    print("\n4️⃣ Security Features:")
    print("   🔐 Private keys generated using cryptographically secure random")
    print("   🏦 All credentials encrypted and stored in Supabase vault")
    print("   🛡️ Response includes full private key for new accounts")
    print("   👁️ Status endpoint masks sensitive information")
    print("   🔄 Each generation creates completely unique account")

def print_api_examples():
    """Print API usage examples"""
    
    print("""
📚 API Usage Examples

🚀 Generate New Account (No Input Required):
```bash
curl -X POST "http://localhost:8000/api/v1/users/user_123/x10/generate-account" \\
  -H "Content-Type: application/json" \\
  -d '{"user_id": "user_123"}'
```

📊 Check Account Status:
```bash
curl -X GET "http://localhost:8000/api/v1/users/user_123/x10/status"
```

🔑 Onboard with Existing Key:
```bash
curl -X POST "http://localhost:8000/api/v1/users/user_123/x10/onboard" \\
  -H "Content-Type: application/json" \\
  -d '{
    "eth_private_key": "0x1234567890abcdef...",
    "user_id": "user_123"
  }'
```

🐍 Python Example:
```python
import httpx

async def generate_x10_account(user_id):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"http://localhost:8000/api/v1/users/{user_id}/x10/generate-account",
            json={"user_id": user_id}
        )
        return response.json()

# Usage
account = await generate_x10_account("user_123")
print(f"Generated ETH Address: {account['generated_account']['eth_address']}")
```

📱 Frontend Integration:
```javascript
// Generate new account for user
const generateAccount = async (userId) => {
  const response = await fetch(`/api/v1/users/${userId}/x10/generate-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  
  const result = await response.json();
  
  if (result.success) {
    const account = result.generated_account;
    console.log('New ETH Address:', account.eth_address);
    console.log('Private Key:', account.eth_private_key);
    // Store private key securely in your app
  }
};
```
""")

if __name__ == "__main__":
    print("🎯 X10 Account Generation from Zero - Complete Guide")
    print("=" * 60)
    
    # Print comparison
    print_comparison()
    
    print("\n" + "=" * 60)
    
    # Demonstrate key generation
    asyncio.run(demonstrate_key_generation())
    
    print("\n" + "=" * 60)
    
    # Print API examples
    print_api_examples()
    
    print("\n" + "=" * 60)
    print("🎉 Summary:")
    print("✅ X10 Account Generation creates accounts from zero")
    print("✅ No input required - completely automated")
    print("✅ Perfect for new users and mobile apps")
    print("✅ All credentials stored securely in Supabase vault")
    print("✅ Ready to trade immediately after generation")
    print("✅ Full X10 perpetual trading capabilities")

