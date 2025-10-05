# FastAPI Backend Implementation Guide

## 🗃️ Database Schema Required

### **Users Table**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extended_stark_private_key TEXT NOT NULL,  -- Para Extended Exchange
    cavos_user_id TEXT,                        -- ID de Cavos Wallet (opcional)
    email TEXT,
    provider TEXT,                             -- 'apple' | 'google'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Trading specific fields
    total_volume DECIMAL DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    total_pnl DECIMAL DEFAULT 0,
    
    UNIQUE(extended_stark_private_key)
);
```

### **User Progress Table (Para misiones)**
```sql
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_planet INTEGER DEFAULT 1,
    unlocked_planets INTEGER[] DEFAULT '{1}',
    completed_missions TEXT[] DEFAULT '{}',
    achievements TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Orders Table (Para tracking de trading)**
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    extended_order_id TEXT,                    -- ID de Extended Exchange
    symbol TEXT NOT NULL,
    side TEXT NOT NULL,                        -- 'buy' | 'sell'
    type TEXT NOT NULL,                        -- 'market' | 'limit'
    quantity DECIMAL NOT NULL,
    price DECIMAL,
    status TEXT DEFAULT 'pending',             -- 'pending' | 'filled' | 'cancelled'
    filled_quantity DECIMAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 FastAPI Implementation

### **1. Main User Creation Endpoint**

```python
# app/routers/users.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.extended_exchange import ExtendedExchangeService
from app.models.user import User, UserProgress
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/users/", response_model=dict)
async def create_user(db: Session = Depends(get_db)):
    """
    Create new user with Extended Exchange private key
    Frontend calls this after Cavos wallet creation
    """
    try:
        # Step 1: Generate Extended Exchange private key
        extended_service = ExtendedExchangeService()
        private_key = extended_service.generate_private_key()
        
        # Step 2: Verify key works with Extended Exchange
        if not extended_service.verify_private_key(private_key):
            raise HTTPException(status_code=500, detail="Failed to generate valid trading key")
        
        # Step 3: Create user in database
        user = User(
            id=uuid.uuid4(),
            extended_stark_private_key=private_key,
            created_at=datetime.utcnow(),
            is_active=True
        )
        
        db.add(user)
        db.flush()  # Get the ID
        
        # Step 4: Initialize user progress for missions
        progress = UserProgress(
            user_id=user.id,
            total_xp=0,
            level=1,
            current_planet=1,
            unlocked_planets=[1],
            completed_missions=[],
            achievements=[]
        )
        
        db.add(progress)
        db.commit()
        
        # Step 5: Return ONLY user_id (NEVER the private key)
        return {
            "user_id": str(user.id),
            "created_at": user.created_at.isoformat()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"User creation failed: {str(e)}")
```

### **2. Extended Exchange Service**

```python
# app/services/extended_exchange.py
import secrets
import hashlib
from typing import Optional
import requests

class ExtendedExchangeService:
    def __init__(self):
        self.api_base = "https://api.extended.exchange/v1"
        self.api_key = "YOUR_EXTENDED_API_KEY"
    
    def generate_private_key(self) -> str:
        """Generate a valid StarkNet private key for Extended Exchange"""
        # Generate 32 random bytes
        random_bytes = secrets.token_bytes(32)
        
        # Convert to hex (without 0x prefix)
        private_key = random_bytes.hex()
        
        # Ensure it's a valid StarkNet private key (less than curve order)
        # This is a simplified version - you should use proper StarkNet key generation
        return f"0x{private_key}"
    
    def verify_private_key(self, private_key: str) -> bool:
        """Verify the private key works with Extended Exchange"""
        try:
            # Test the key by making a simple API call
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "X-Stark-Private-Key": private_key
            }
            
            response = requests.get(
                f"{self.api_base}/account/balance",
                headers=headers,
                timeout=10
            )
            
            # Key is valid if we get a response (even if account is empty)
            return response.status_code in [200, 404]
            
        except Exception:
            return False
    
    def place_order(self, user_id: str, private_key: str, order_data: dict):
        """Place order on Extended Exchange using user's private key"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "X-Stark-Private-Key": private_key,
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{self.api_base}/orders",
            headers=headers,
            json=order_data,
            timeout=30
        )
        
        return response.json()
```

### **3. Order Placement with DB Tracking**

```python
# app/routers/orders.py
@router.post("/orders/")
async def place_order(
    order_request: PlaceOrderRequest,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    """Place order and track in database"""
    
    # Step 1: Get user and private key
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Step 2: Place order on Extended Exchange
    extended_service = ExtendedExchangeService()
    order_data = {
        "symbol": order_request.symbol,
        "side": order_request.side,
        "type": order_request.type,
        "quantity": str(order_request.quantity),
        "price": str(order_request.price) if order_request.price else None
    }
    
    try:
        # Use user's private key to place order
        extended_result = extended_service.place_order(
            user_id, 
            user.extended_stark_private_key, 
            order_data
        )
        
        # Step 3: Save order to our database
        order = Order(
            id=uuid.uuid4(),
            user_id=user.id,
            extended_order_id=extended_result.get("order_id"),
            symbol=order_request.symbol,
            side=order_request.side,
            type=order_request.type,
            quantity=order_request.quantity,
            price=order_request.price,
            status="pending"
        )
        
        db.add(order)
        db.commit()
        
        return {
            "id": str(order.id),
            "extended_order_id": extended_result.get("order_id"),
            "status": "pending",
            "created_at": order.created_at.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Order failed: {str(e)}")
```

### **4. Database Models**

```python
# app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, Integer, DECIMAL, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    extended_stark_private_key = Column(String, nullable=False, unique=True)
    cavos_user_id = Column(String, nullable=True)
    email = Column(String, nullable=True)
    provider = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Trading stats
    total_volume = Column(DECIMAL, default=0)
    total_trades = Column(Integer, default=0)
    total_pnl = Column(DECIMAL, default=0)

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    current_planet = Column(Integer, default=1)
    unlocked_planets = Column(ARRAY(Integer), default=[1])
    completed_missions = Column(ARRAY(String), default=[])
    achievements = Column(ARRAY(String), default=[])
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
```

## 🔒 Security Implementation

### **Environment Variables**
```bash
# .env
DATABASE_URL=postgresql://user:password@localhost/astrade
EXTENDED_EXCHANGE_API_KEY=your_api_key_here
EXTENDED_EXCHANGE_BASE_URL=https://api.extended.exchange/v1
SECRET_KEY=your_jwt_secret_key
```

### **Private Key Security**
```python
# app/utils/encryption.py
from cryptography.fernet import Fernet
import os

def encrypt_private_key(private_key: str) -> str:
    """Encrypt private key before storing in DB"""
    key = os.getenv("ENCRYPTION_KEY").encode()
    f = Fernet(key)
    encrypted = f.encrypt(private_key.encode())
    return encrypted.decode()

def decrypt_private_key(encrypted_key: str) -> str:
    """Decrypt private key when using for trading"""
    key = os.getenv("ENCRYPTION_KEY").encode()
    f = Fernet(key)
    decrypted = f.decrypt(encrypted_key.encode())
    return decrypted.decode()
```

## 📊 Mission Progress Tracking

```python
# app/services/mission_service.py
class MissionService:
    def __init__(self, db: Session):
        self.db = db
    
    def process_trade_event(self, user_id: str, order: Order):
        """Process trading event for mission progress"""
        user_progress = self.db.query(UserProgress).filter(
            UserProgress.user_id == user_id
        ).first()
        
        if not user_progress:
            return
        
        # Example: "Complete 5 market orders" mission
        if order.type == "market" and order.status == "filled":
            market_orders_count = self.db.query(Order).filter(
                Order.user_id == user_id,
                Order.type == "market",
                Order.status == "filled"
            ).count()
            
            if market_orders_count >= 5:
                self.complete_mission(user_id, "crypto_prime_basic_trading")
    
    def complete_mission(self, user_id: str, mission_id: str):
        """Mark mission as completed and award XP"""
        user_progress = self.db.query(UserProgress).filter(
            UserProgress.user_id == user_id
        ).first()
        
        if mission_id not in user_progress.completed_missions:
            user_progress.completed_missions.append(mission_id)
            user_progress.total_xp += 100  # Award XP
            self.db.commit()
```

## 🚀 Deployment Steps

### **1. Setup Database**
```bash
# Create PostgreSQL database
createdb astrade

# Run migrations
alembic upgrade head
```

### **2. Environment Setup**
```bash
# Install dependencies
pip install fastapi sqlalchemy psycopg2 requests cryptography

# Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost/astrade"
export EXTENDED_EXCHANGE_API_KEY="your_key"
```

### **3. Run Server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🧪 Testing the Flow

### **Frontend Test**
```typescript
// Test user creation
const result = await createUser('apple');
console.log(result); // { success: true }

// Test order placement  
const order = await ordersService.marketBuy('BTCUSD', 0.001);
console.log(order); // { id: "...", status: "pending" }
```

### **Backend Test**
```bash
# Test user creation
curl -X POST http://localhost:8000/users/

# Test order placement
curl -X POST http://localhost:8000/orders/ \
  -H "X-User-ID: user-uuid" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSD","side":"buy","type":"market","quantity":0.001}'
```

## 📋 Implementation Checklist

- [ ] **Database Schema**: Create tables (users, user_progress, orders)
- [ ] **User Creation**: POST /users/ endpoint
- [ ] **Extended Exchange Integration**: Private key generation + API calls
- [ ] **Order Tracking**: Save orders to DB when placed
- [ ] **Mission System**: Track progress based on trading events
- [ ] **Security**: Encrypt private keys in database
- [ ] **Testing**: Verify end-to-end flow works

---

## 🎯 **Summary**

**Frontend maneja**: UI, navegación, autenticación local
**Backend maneja**: Base de datos, Extended Exchange, claves privadas, misiones

La creación de usuario requiere **ambos sistemas trabajando juntos** para la experiencia completa. 