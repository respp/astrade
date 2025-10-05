# AsTrade Authentication Flow

## Overview

AsTrade uses a secure backend-based authentication system that automatically generates Extended Exchange trading keys without exposing them to the client.

## Architecture

```
Mobile App (React Native) ↔ FastAPI Backend ↔ Extended Exchange
        ↑                          ↑                    ↑
   Only user_id             Private keys         Real trading
```

## Flow

### 1. User Registration/Login

When a user opens the app:

1. **Check Existing User**: App checks SecureStore for existing `user_id`
2. **Auto-Navigation**: If found, user is automatically logged in
3. **Create New User**: If not found, user is shown login screen

### 2. User Creation Process

When user clicks "Start Trading Journey":

1. **API Call**: `POST /users/` to FastAPI backend
2. **Backend Actions**:
   - Generates `extended_stark_private_key` securely
   - Stores private key in backend database
   - Returns only `user_id` (UUID) to client
3. **Client Actions**:
   - Stores `user_id` in SecureStore/localStorage
   - Sets `user_id` in API client for future requests
   - Navigates to main app

### 3. Authenticated Requests

All subsequent API calls include:
- **Header**: `X-User-ID: <user_id>`
- **Body**: `user_id` field (for POST/PUT/PATCH)

Backend uses this to:
- Identify the user
- Access their private trading keys
- Execute trades on Extended Exchange

## Security Features

- ✅ **Private keys never leave backend**
- ✅ **Client only stores user_id**
- ✅ **Secure storage (SecureStore/localStorage)**
- ✅ **Automatic session restoration**
- ✅ **Secure logout with cleanup**

## Implementation Details

### Files Modified

- `contexts/AuthContext.tsx` - New auth system
- `lib/api/client.ts` - Added user_id support
- `lib/api/services/account.ts` - User creation endpoint
- `app/login.tsx` - Updated login flow
- `app/_layout.tsx` - Auto-navigation
- `app/(tabs)/profile.tsx` - Show user info

### API Endpoints

```typescript
// Create new user
POST /users/
Response: { user_id: string, created_at: string }

// All other endpoints require user_id
Header: X-User-ID: <user_id>
Body: { user_id: "<user_id>", ...otherData }
```

### State Management

```typescript
interface AuthContextType {
  userId: string | null
  loading: boolean
  authenticated: boolean
  createUser: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}
```

## Usage Examples

### Creating a User

```typescript
const { createUser } = useAuth();

const handleConnect = async () => {
  const result = await createUser();
  if (result.success) {
    // User created and logged in
    // Navigate to main app
  } else {
    // Handle error
    console.error(result.error);
  }
};
```

### Making Authenticated Requests

```typescript
// API client automatically includes user_id
const positions = await accountService.getPositions();
const order = await ordersService.marketBuy('BTCUSD', 0.001);
```

### Logout

```typescript
const { signOut } = useAuth();

const handleLogout = async () => {
  await signOut(); // Clears user_id from storage and API client
  // User is automatically redirected to login
};
```

## Testing

The system works entirely with demo/mock data until connected to your actual FastAPI backend. To test:

1. Update `API_BASE_URL` in `lib/api/client.ts`
2. Ensure your backend has the `/users/` endpoint
3. Run the app and test the flow

## Future Enhancements

- [ ] Refresh tokens for long-term sessions
- [ ] Biometric authentication
- [ ] Multi-device session management
- [ ] Account recovery mechanisms 