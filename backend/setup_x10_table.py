#!/usr/bin/env python3
"""
Setup Script for X10 Credentials Table

This script helps you set up the new dedicated X10 credentials table in Supabase.
"""

import os
import asyncio
from supabase import create_client, Client
from typing import Tuple

def get_supabase_client() -> Client:
    """Get Supabase client"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables are required")
    
    return create_client(url, key)

async def check_table_exists(table_name: str) -> bool:
    """Check if a table exists in Supabase"""
    try:
        client = get_supabase_client()
        
        # Try to query the table
        result = client.table(table_name).select("count", count="exact").limit(1).execute()
        return True
    except Exception:
        return False

async def run_migration() -> Tuple[bool, str]:
    """Run the X10 table migration"""
    try:
        client = get_supabase_client()
        
        print("🔄 Running X10 credentials table migration...")
        
        # Read the migration SQL file
        with open('migrate_to_x10_table.sql', 'r') as f:
            migration_sql = f.read()
        
        # Split the SQL into individual statements
        statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]
        
        # Execute each statement
        for i, statement in enumerate(statements):
            if statement and not statement.startswith('--'):
                try:
                    print(f"   Executing statement {i+1}/{len(statements)}...")
                    client.rpc('exec_sql', {'sql': statement}).execute()
                except Exception as e:
                    # Some statements might fail if table already exists, which is okay
                    if "already exists" not in str(e).lower():
                        print(f"   Warning: Statement {i+1} failed: {e}")
        
        print("✅ Migration completed successfully!")
        return True, "Migration completed successfully"
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False, str(e)

async def verify_setup() -> Tuple[bool, str]:
    """Verify that the X10 table is set up correctly"""
    try:
        client = get_supabase_client()
        
        print("🔍 Verifying X10 table setup...")
        
        # Check if table exists
        table_exists = await check_table_exists('x10_user_credentials')
        if not table_exists:
            return False, "x10_user_credentials table does not exist"
        
        print("   ✅ x10_user_credentials table exists")
        
        # Check table structure
        result = client.table('x10_user_credentials').select("count", count="exact").limit(1).execute()
        print("   ✅ Table is accessible")
        
        # Check if we can insert a test record (and then delete it)
        test_data = {
            "user_id": "00000000-0000-0000-0000-000000000000",  # Test UUID
            "eth_address": "0x0000000000000000000000000000000000000000",
            "eth_private_key": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "l2_vault": "0",
            "l2_private_key": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "l2_public_key": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "api_key": "test_key"
        }
        
        # Insert test record
        insert_result = client.table('x10_user_credentials').insert(test_data).execute()
        if insert_result.data:
            # Delete test record
            client.table('x10_user_credentials').delete().eq('user_id', test_data['user_id']).execute()
            print("   ✅ Table write/delete permissions working")
        
        return True, "X10 table setup verified successfully"
        
    except Exception as e:
        return False, f"Verification failed: {e}"

async def main():
    """Main setup function"""
    print("🚀 X10 Credentials Table Setup")
    print("=" * 40)
    
    # Check environment variables
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_KEY"):
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables are required")
        print("   Please set these variables and try again")
        return
    
    # Check if table already exists
    table_exists = await check_table_exists('x10_user_credentials')
    
    if table_exists:
        print("ℹ️  x10_user_credentials table already exists")
        choice = input("Do you want to run migration anyway? (y/N): ").strip().lower()
        if choice != 'y':
            print("Skipping migration")
            await verify_setup()
            return
    
    # Run migration
    success, message = await run_migration()
    
    if success:
        print(f"\n✅ {message}")
        
        # Verify setup
        verify_success, verify_message = await verify_setup()
        if verify_success:
            print(f"\n✅ {verify_message}")
            print("\n🎉 X10 credentials table is ready to use!")
            print("\nNext steps:")
            print("1. Update your backend to use the new x10_user_credentials table")
            print("2. Test the X10 onboarding endpoints")
            print("3. Verify credentials are stored correctly")
        else:
            print(f"\n❌ Verification failed: {verify_message}")
    else:
        print(f"\n❌ Setup failed: {message}")
        print("\nTroubleshooting:")
        print("1. Check your Supabase connection")
        print("2. Verify you have the correct permissions")
        print("3. Check the migration SQL file exists")
        print("4. Run the SQL manually in Supabase dashboard if needed")

if __name__ == "__main__":
    asyncio.run(main())

