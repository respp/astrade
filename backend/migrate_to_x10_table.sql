-- ============================================
-- MIGRATION: Create X10 Dedicated Table
-- Migrate from astrade_user_credentials to x10_user_credentials
-- ============================================

-- Step 1: Create the new dedicated X10 table
CREATE TABLE IF NOT EXISTS public.x10_user_credentials (
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
    environment VARCHAR(10) DEFAULT 'testnet' CHECK (environment IN ('testnet', 'mainnet')),
    
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

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_x10_credentials_user_id ON public.x10_user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_x10_credentials_eth_address ON public.x10_user_credentials(eth_address);
CREATE INDEX IF NOT EXISTS idx_x10_credentials_l2_vault ON public.x10_user_credentials(l2_vault);
CREATE INDEX IF NOT EXISTS idx_x10_credentials_environment ON public.x10_user_credentials(environment);

-- Step 3: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_x10_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 4: Create trigger
CREATE TRIGGER update_x10_credentials_updated_at_trigger
    BEFORE UPDATE ON public.x10_user_credentials
    FOR EACH ROW EXECUTE FUNCTION update_x10_credentials_updated_at();

-- Step 5: Enable RLS
ALTER TABLE public.x10_user_credentials ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY "Users can only access their own X10 credentials" 
ON public.x10_user_credentials
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own X10 credentials" 
ON public.x10_user_credentials
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own X10 credentials" 
ON public.x10_user_credentials
FOR UPDATE USING (auth.uid() = user_id);

-- Step 7: Migrate existing X10 data (if any exists)
-- This will migrate data from the old x10_* columns to the new dedicated table
INSERT INTO public.x10_user_credentials (
    user_id,
    eth_address,
    eth_private_key,
    l2_vault,
    l2_private_key,
    l2_public_key,
    api_key,
    claim_id,
    asset_operations,
    environment,
    generated_from_zero,
    original_eth_key_provided,
    created_at,
    updated_at
)
SELECT 
    user_id,
    x10_eth_address,
    x10_eth_private_key,
    x10_l2_vault,
    x10_l2_private_key,
    x10_l2_public_key,
    x10_api_key,
    x10_claim_id,
    x10_asset_operations,
    COALESCE(x10_environment, environment),
    false, -- Assume existing data was not generated from zero
    true,  -- Assume existing data had original ETH key provided
    created_at,
    updated_at
FROM public.astrade_user_credentials
WHERE x10_l2_vault IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Step 8: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.x10_user_credentials TO authenticated;
GRANT ALL ON public.x10_user_credentials TO service_role;

-- Step 9: Add comments for documentation
COMMENT ON TABLE public.x10_user_credentials IS 'Dedicated table for X10 perpetual trading credentials';
COMMENT ON COLUMN public.x10_user_credentials.eth_address IS 'Ethereum address for L1 operations';
COMMENT ON COLUMN public.x10_user_credentials.eth_private_key IS 'Ethereum private key for L1 operations';
COMMENT ON COLUMN public.x10_user_credentials.l2_vault IS 'X10 L2 vault ID';
COMMENT ON COLUMN public.x10_user_credentials.l2_private_key IS 'X10 L2 private key';
COMMENT ON COLUMN public.x10_user_credentials.l2_public_key IS 'X10 L2 public key';
COMMENT ON COLUMN public.x10_user_credentials.api_key IS 'X10 trading API key';
COMMENT ON COLUMN public.x10_user_credentials.claim_id IS 'X10 testnet funds claim ID';
COMMENT ON COLUMN public.x10_user_credentials.generated_from_zero IS 'True if account was generated from zero';

-- Step 10: Optional - Clean up old X10 columns from astrade_user_credentials
-- Uncomment these lines if you want to remove the old X10 columns after migration
/*
ALTER TABLE public.astrade_user_credentials DROP COLUMN IF EXISTS x10_l2_vault;
ALTER TABLE public.astrade_user_credentials DROP COLUMN IF EXISTS x10_l2_private_key;
ALTER TABLE public.astrade_user_credentials DROP COLUMN IF EXISTS x10_l2_public_key;
ALTER TABLE public.astrade_user_credentials DROP COLUMN IF EXISTS x10_api_key;
ALTER TABLE public.astrade_user_credentials DROP COLUMN IF EXISTS x10_eth_address;
ALTER TABLE public.astrade_user_credentials DROP COLUMN IF EXISTS x10_eth_private_key;
ALTER TABLE public.astrade_user_credentials DROP COLUMN IF EXISTS x10_claim_id;
ALTER TABLE public.astrade_user_credentials DROP COLUMN IF EXISTS x10_environment;
ALTER TABLE public.astrade_user_credentials DROP COLUMN IF EXISTS x10_asset_operations;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'x10_user_credentials'
ORDER BY ordinal_position;

-- Check if data was migrated successfully
SELECT 
    COUNT(*) as total_x10_credentials,
    COUNT(CASE WHEN generated_from_zero THEN 1 END) as generated_from_zero,
    COUNT(CASE WHEN original_eth_key_provided THEN 1 END) as with_original_key
FROM public.x10_user_credentials;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'x10_user_credentials';

