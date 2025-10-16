# X10 Credentials - New Dedicated Table Guide

## 🎯 **Problem Solved**

The previous implementation was storing X10 credentials in the `astrade_user_credentials` table with `x10_` prefixed columns, which was causing confusion and potential conflicts. 

**NEW SOLUTION:** Dedicated `x10_user_credentials` table specifically for X10 perpetual trading credentials.

## 📋 **New Table Structure**

### **Table Name:** `public.x10_user_credentials`

```sql
CREATE TABLE public.x10_user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Ethereum Account (L1)
    eth_address VARCHAR(42) NOT NULL,
    eth_private_key TEXT NOT NULL,
    
    -- X10 L2 Account Details
    l2_vault VARCHAR(255) NOT NULL,
    l2_private_key TEXT NOT NULL,
    l2_public_key TEXT NOT NULL,
    
    -- X10 API Credentials
    api_key VARCHAR(255) NOT NULL,
    api_secret VARCHAR(255),
    
    -- X10 Account Status
    claim_id VARCHAR(255),
    asset_operations JSONB,
    environment VARCHAR(10) DEFAULT 'testnet',
    
    -- Account Generation Info
    generated_from_zero BOOLEAN DEFAULT false,
    original_eth_key_provided BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id),
    UNIQUE(eth_address),
    UNIQUE(l2_vault)
);
```

## 🔧 **Setup Instructions**

### **Option 1: Run Migration Script**
```bash
# Set your Supabase credentials
export SUPABASE_URL="your_supabase_url"
export SUPABASE_KEY="your_supabase_key"

# Run the setup script
python setup_x10_table.py
```

### **Option 2: Manual SQL Execution**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrate_to_x10_table.sql`
4. Execute the SQL

### **Option 3: Use the Table Creation File**
1. Copy the contents of `x10_credentials_table.sql`
2. Execute in Supabase SQL Editor

## 🔐 **Security Features**

✅ **Row Level Security (RLS)** enabled
✅ **Unique constraints** on user_id, eth_address, and l2_vault
✅ **Foreign key** references to auth.users
✅ **Automatic timestamps** with triggers
✅ **Proper indexes** for performance

## 📊 **Data Storage Examples**

### **X10 Onboarding (with existing ETH key):**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "eth_address": "0x1234567890abcdef1234567890abcdef12345678",
  "eth_private_key": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "l2_vault": "123456",
  "l2_private_key": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
  "l2_public_key": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
  "api_key": "trading_key_12345",
  "claim_id": "claim_67890",
  "environment": "testnet",
  "generated_from_zero": false,
  "original_eth_key_provided": true
}
```

### **X10 Account Generation (from zero):**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "eth_address": "0x9876543210fedcba9876543210fedcba98765432",
  "eth_private_key": "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876",
  "l2_vault": "789012",
  "l2_private_key": "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876",
  "l2_public_key": "0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
  "api_key": "trading_key_54321",
  "claim_id": "claim_09876",
  "environment": "testnet",
  "generated_from_zero": true,
  "original_eth_key_provided": false
}
```

## 🔄 **Migration from Old Structure**

The migration script automatically moves data from:
- `astrade_user_credentials.x10_*` columns
- To the new `x10_user_credentials` table

### **Migration Process:**
1. ✅ Creates new dedicated table
2. ✅ Sets up indexes and constraints
3. ✅ Enables RLS policies
4. ✅ Migrates existing data
5. ✅ Verifies setup

## 📈 **API Integration**

### **Updated Service Methods:**

```python
# Store credentials (now uses dedicated table)
await x10_onboarding_service._store_credentials_in_vault(user_id, account_data)

# Retrieve credentials (now from dedicated table)
credentials = await x10_onboarding_service.get_user_x10_credentials(user_id)
```

### **Database Operations:**

```python
# Insert new X10 credentials
result = db.table('x10_user_credentials').upsert(credentials_data).execute()

# Get user's X10 credentials
result = db.table('x10_user_credentials').select("*").eq('user_id', user_id).execute()
```

## 🔍 **Verification Queries**

### **Check if table exists:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'x10_user_credentials';
```

### **View table structure:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'x10_user_credentials'
ORDER BY ordinal_position;
```

### **Check stored credentials:**
```sql
SELECT 
    user_id,
    eth_address,
    l2_vault,
    environment,
    generated_from_zero,
    created_at
FROM x10_user_credentials
ORDER BY created_at DESC;
```

## 🎯 **Benefits of New Structure**

✅ **Clean Separation:** X10 credentials in dedicated table
✅ **Better Performance:** Optimized indexes for X10 queries
✅ **Clearer Schema:** No confusing column prefixes
✅ **Easier Maintenance:** Dedicated table for X10 operations
✅ **Future-Proof:** Easy to extend with X10-specific features
✅ **Better Security:** Dedicated RLS policies for X10 data

## 🚀 **Next Steps**

1. **Run the migration** using one of the setup options
2. **Update your backend** to use the new table (already done in the service)
3. **Test the endpoints** to ensure everything works
4. **Verify data storage** using the verification queries
5. **Monitor performance** and adjust indexes if needed

## 📞 **Troubleshooting**

### **Common Issues:**

**Table doesn't exist:**
- Run the migration script
- Check Supabase permissions

**Migration fails:**
- Verify SQL syntax in Supabase dashboard
- Check for existing table conflicts

**Data not appearing:**
- Check RLS policies
- Verify user authentication
- Check foreign key constraints

### **Support:**
- Check Supabase logs
- Verify environment variables
- Test with sample data first

The new dedicated table structure provides a clean, secure, and performant way to store X10 perpetual trading credentials!

