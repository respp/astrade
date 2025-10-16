#!/usr/bin/env python3
"""
X10 Perpetual Trading Onboarding Example

This script demonstrates how to use the X10 onboarding service directly,
following the pattern from your provided example.
"""

import asyncio
from eth_account import Account
from eth_account.signers.local import LocalAccount

from x10.perpetual.accounts import StarkPerpetualAccount
from x10.perpetual.configuration import TESTNET_CONFIG
from x10.perpetual.trading_client.trading_client import PerpetualTradingClient
from x10.perpetual.user_client.user_client import UserClient


async def x10_onboard_example():
    """
    X10 onboarding example based on your provided code
    """
    
    # Replace with your actual Ethereum private key
    ETH_PRIVATE_KEY = "YOUR_ETH_PRIVATE_KEY_HERE"
    
    if ETH_PRIVATE_KEY == "YOUR_ETH_PRIVATE_KEY_HERE":
        print("⚠️  Please replace ETH_PRIVATE_KEY with your actual Ethereum private key")
        print("You can generate one using: Account.create().key.hex()")
        return
    
    print("🚀 Starting X10 Perpetual Trading Onboarding...")
    
    try:
        # Step 1: Create Ethereum account from private key
        environment_config = TESTNET_CONFIG
        eth_account_1: LocalAccount = Account.from_key(ETH_PRIVATE_KEY)
        print(f"✅ Created Ethereum account: {eth_account_1.address}")
        
        # Step 2: Create onboarding client
        onboarding_client = UserClient(
            endpoint_config=environment_config, 
            l1_private_key=eth_account_1.key.hex
        )
        print("✅ Created X10 onboarding client")
        
        # Step 3: Onboard to get root account
        print("🔄 Onboarding to X10 platform...")
        root_account = await onboarding_client.onboard()
        print("✅ Successfully onboarded to X10")
        
        # Step 4: Create trading API key
        print("🔄 Creating trading API key...")
        trading_key = await onboarding_client.create_account_api_key(
            root_account.account, 
            "trading_key"
        )
        print("✅ Trading API key created")
        
        # Step 5: Create trading client
        root_trading_client = PerpetualTradingClient(
            environment_config,
            StarkPerpetualAccount(
                vault=root_account.account.l2_vault,
                private_key=root_account.l2_key_pair.private_hex,
                public_key=root_account.l2_key_pair.public_hex,
                api_key=trading_key,
            ),
        )
        print("✅ Trading client created")
        
        # Step 6: Display account information
        print("\n📊 Account Information:")
        print(f"L2 Vault: {root_account.account.l2_vault}")
        print(f"L2 Public Key: {root_account.l2_key_pair.public_hex}")
        print(f"L2 Private Key: {root_account.l2_key_pair.private_hex}")
        print(f"Trading API Key: {trading_key}")
        
        # Step 7: Claim testnet funds
        print("\n🔄 Claiming testnet funds...")
        claim_response = await root_trading_client.testnet.claim_testing_funds()
        claim_id = claim_response.data.id if claim_response.data else None
        print(f"✅ Claim ID: {claim_id}")
        
        # Step 8: Check asset operations
        if claim_id:
            print("🔄 Checking asset operations...")
            resp = await root_trading_client.account.asset_operations(id=claim_id)
            print(f"✅ Asset Operations: {resp.data}")
        
        # Step 9: Store in Supabase (example)
        print("\n💾 Storing credentials in Supabase vault...")
        account_data = {
            "l2_vault": str(root_account.account.l2_vault),
            "l2_public_key": root_account.l2_key_pair.public_hex,
            "l2_private_key": root_account.l2_key_pair.private_hex,
            "api_key": trading_key,
            "eth_address": eth_account_1.address,
            "eth_private_key": ETH_PRIVATE_KEY,
            "claim_id": claim_id,
            "environment": "testnet"
        }
        
        # Here you would store account_data in your Supabase vault
        print("✅ Credentials prepared for Supabase storage:")
        print(f"   - L2 Vault: {account_data['l2_vault']}")
        print(f"   - ETH Address: {account_data['eth_address']}")
        print(f"   - API Key: {account_data['api_key']}")
        print(f"   - Claim ID: {account_data['claim_id']}")
        
        print("\n🎉 X10 Onboarding Completed Successfully!")
        print("You can now use the trading client for perpetual trading operations.")
        
    except Exception as e:
        print(f"\n❌ X10 Onboarding Failed: {str(e)}")
        print(f"Error Type: {type(e).__name__}")
        print("\nTroubleshooting:")
        print("1. Check your Ethereum private key format")
        print("2. Ensure you have internet connection")
        print("3. Verify X10 testnet is accessible")
        print("4. Check if you have sufficient ETH for gas fees")


async def generate_test_account():
    """Generate a test Ethereum account for development"""
    print("🔑 Generating test Ethereum account...")
    
    account = Account.create()
    
    print(f"✅ Test Account Generated:")
    print(f"Private Key: {account.key.hex()}")
    print(f"Address: {account.address}")
    print(f"\n⚠️  IMPORTANT: This is for testing only!")
    print(f"   - Do not use this key for real funds")
    print(f"   - Generate a new key for production")
    print(f"   - Keep your private keys secure")
    
    return account


def print_usage_instructions():
    """Print usage instructions"""
    print("""
🎯 X10 Perpetual Trading Onboarding Instructions

1. Get an Ethereum Private Key:
   - Use MetaMask or similar wallet
   - Export private key (be careful with security!)
   - Or generate a test key using generate_test_account()

2. Replace ETH_PRIVATE_KEY in the script with your key

3. Run the script:
   python x10_onboarding_example.py

4. The script will:
   - Create X10 account
   - Generate trading API key
   - Claim testnet funds
   - Display all account information
   - Prepare data for Supabase storage

5. Store the credentials securely in your database

🔒 Security Notes:
- Never share your private keys
- Use testnet for development
- Store credentials encrypted
- Use environment variables for keys

📚 API Integration:
- Use the /api/v1/users/{user_id}/x10/onboard endpoint
- Pass eth_private_key and user_id
- Get back account data and trading capabilities
""")


if __name__ == "__main__":
    print("🚀 X10 Perpetual Trading Onboarding Example")
    print("=" * 50)
    
    # Print usage instructions
    print_usage_instructions()
    
    print("\n" + "=" * 50)
    
    # Ask user what they want to do
    choice = input("""
Choose an option:
1. Generate test Ethereum account
2. Run X10 onboarding example
3. Both

Enter choice (1/2/3): """).strip()
    
    if choice == "1":
        asyncio.run(generate_test_account())
    elif choice == "2":
        asyncio.run(x10_onboard_example())
    elif choice == "3":
        asyncio.run(generate_test_account())
        print("\n" + "=" * 30)
        asyncio.run(x10_onboard_example())
    else:
        print("Invalid choice. Running onboarding example...")
        asyncio.run(x10_onboard_example())

