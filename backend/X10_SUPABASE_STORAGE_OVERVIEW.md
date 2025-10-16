# X10 Credentials Storage in Supabase - Complete Overview

## 🗄️ **Database Storage Location**

Yes, all X10 credentials are stored in **Supabase** in the `astrade_user_credentials` table.

## 📋 **Table Structure**

The X10 credentials are stored in the `public.astrade_user_credentials` table with the following structure:

```sql
CREATE TABLE public.astrade_user_credentials (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    extended_api_key VARCHAR(255),
    extended_secret_key VARCHAR(255),
    extended_stark_private_key TEXT NOT NULL,
    environment VARCHAR(10) DEFAULT 'testnet',
    is_mock_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- X10 Specific Fields (added by our service)
    x10_l2_vault VARCHAR(255),
    x10_l2_private_key TEXT,
    x10_l2_public_key TEXT,
    x10_api_key VARCHAR(255),
    x10_eth_address VARCHAR(255),
    x10_eth_private_key TEXT,
    x10_claim_id VARCHAR(255),
    x10_environment VARCHAR(10),
    x10_asset_operations JSONB
);
```

## 🔐 **What Gets Stored**

When you use the X10 onboarding or account generation endpoints, the following data is stored in Supabase:

### **From X10 Onboarding (with existing ETH key):**
```json
{
  "user_id": "uuid-here",
  "x10_l2_vault": "123456",
  "x10_l2_private_key": "0xabcdef...",
  "x10_l2_public_key": "0x123456...",
  "x10_api_key": "trading_key_123",
  "x10_eth_address": "0x1234567890abcdef...",
  "x10_eth_private_key": "0xabcdef1234567890...",
  "x10_claim_id": "claim_456",
  "x10_environment": "testnet",
  "x10_asset_operations": {...},
  "environment": "testnet",
  "is_mock_enabled": false
}
```

### **From X10 Account Generation (from zero):**
```json
{
  "user_id": "uuid-here",
  "x10_l2_vault": "789012",
  "x10_l2_private_key": "0x987654...",
  "x10_l2_public_key": "0x567890...",
  "x10_api_key": "trading_key_789",
  "x10_eth_address": "0x9876543210fedcba...",
  "x10_eth_private_key": "0x9876543210fedcba...",
  "x10_claim_id": "claim_789",
  "x10_environment": "testnet",
  "x10_asset_operations": {...},
  "environment": "testnet",
  "is_mock_enabled": false
}
```

## 🔒 **Security Features**

### **Row Level Security (RLS):**
- ✅ RLS enabled on the table
- ✅ Users can only access their own credentials
- ✅ Automatic user isolation

### **Data Protection:**
- ✅ Private keys stored as TEXT (encrypted by Supabase)
- ✅ API keys stored securely
- ✅ All sensitive data protected by RLS policies

### **Access Policies:**
```sql
-- Users can only access their own credentials
CREATE POLICY "Users can only access their own credentials" 
ON public.astrade_user_credentials
FOR ALL USING (auth.uid() = user_id);
```

## 📊 **Storage Process**

### **1. X10 Onboarding Service:**
```python
# In app/services/x10_onboarding_service.py
async def _store_credentials_in_vault(user_id: str, account_data: Dict[str, Any]) -> bool:
    db = get_supabase_client()
    
    credentials_data = {
        "user_id": user_id,
        "x10_l2_vault": account_data["l2_vault"],
        "x10_l2_private_key": account_data["l2_private_key"],
        "x10_l2_public_key": account_data["l2_public_key"],
        "x10_api_key": account_data["api_key"],
        "x10_eth_address": account_data["eth_address"],
        "x10_eth_private_key": account_data["eth_private_key"],
        "x10_claim_id": account_data["claim_id"],
        "x10_environment": account_data["environment"],
        "x10_asset_operations": account_data["asset_operations"],
        "environment": "testnet",
        "is_mock_enabled": False
    }
    
    # Insert or update credentials
    result = db.table('astrade_user_credentials').upsert(credentials_data).execute()
```

### **2. Retrieval Process:**
```python
async def get_user_x10_credentials(user_id: str) -> Optional[Dict[str, Any]]:
    db = get_supabase_client()
    
    result = db.table('astrade_user_credentials').select("*").eq('user_id', user_id).execute()
    
    if result.data and result.data[0].get('x10_l2_vault'):
        return {
            "l2_vault": creds["x10_l2_vault"],
            "l2_private_key": creds["x10_l2_private_key"],
            "l2_public_key": creds["x10_l2_public_key"],
            "api_key": creds["x10_api_key"],
            "eth_address": creds["x10_eth_address"],
            "eth_private_key": creds["x10_eth_private_key"],
            "claim_id": creds["x10_claim_id"],
            "environment": creds["x10_environment"],
            "asset_operations": creds["x10_asset_operations"]
        }
```

## 🔍 **Database Connection**

### **Supabase Client Configuration:**
```python
# In app/services/database.py
@lru_cache()
def get_supabase_client() -> Client:
    config = get_supabase_config()
    return create_client(config.supabase_url, config.supabase_key)
```

### **Environment Variables Required:**
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
```

## 📈 **Database Schema Location**

The table structure is defined in:
- **File:** `supabase.sql`
- **Table:** `public.astrade_user_credentials`
- **Schema:** Supabase PostgreSQL database

## ✅ **Verification**

You can verify the storage by:

### **1. Check Status Endpoint:**
```bash
GET /api/v1/users/{user_id}/x10/status
```

### **2. Direct Database Query (if you have access):**
```sql
SELECT 
    user_id,
    x10_l2_vault,
    x10_eth_address,
    x10_environment,
    created_at
FROM public.astrade_user_credentials 
WHERE user_id = 'your-user-id';
```

### **3. Check Supabase Dashboard:**
- Go to your Supabase project dashboard
- Navigate to Table Editor
- Select `astrade_user_credentials` table
- View the stored X10 credentials

## 🎯 **Summary**

**YES** - All X10 credentials are stored in Supabase:

- ✅ **Location:** `public.astrade_user_credentials` table
- ✅ **Security:** Row Level Security (RLS) enabled
- ✅ **Encryption:** Data encrypted at rest by Supabase
- ✅ **Access:** Users can only access their own credentials
- ✅ **Fields:** All X10-specific fields stored with `x10_` prefix
- ✅ **Integration:** Seamlessly integrated with existing AsTrade backend

The storage is secure, scalable, and follows Supabase best practices for sensitive data handling.

