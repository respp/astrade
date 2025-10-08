# AsTrade Backend

## 📚 **Documentation**

* [📡 **Endpoints**](docs/ENDPOINTS.md) – All API endpoints
* [🏗️ **Structure**](docs/BACKEND_STRUCTURE_ANALYSIS.md) – Backend architecture analysis

---

## 🚀 **Quick Start Guide**

### **Prerequisites**

- Python 3.13+ (tested with 3.13.7)
- PostgreSQL (via Supabase)
- Git

---

### **Step 1: Set Up Supabase**

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database setup script:**
   - Open the SQL Editor in Supabase
   - Copy and paste the contents of [`setup_database.sql`](setup_database.sql)
   - Execute the script

**📁 Full SQL file:** [`setup_database.sql`](setup_database.sql)

> **Note:** The SQL script includes:
> - User tables (wallets, credentials, profiles)
> - Reward system and NFTs
> - Planets and quizzes
> - User progress tracking
> - RLS enabled with security policies
> - Automatic `updated_at` triggers
> - Indexes for performance

---

### **Step 2: Install Dependencies**

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
```

---

### **Step 3: Configure Environment Variables**

```bash
# Copy the example file
cp extended.env.example .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

**Required variables in `.env`:**

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# Application Settings
SECRET_KEY=your-secret-key-for-jwt
DEBUG=true

# Extended/StarkNet (required, use placeholder values for dev)
EXTENDED_SECRET_PUBLIC_KEY=your-public-key-here
EXTENDED_API_KEY=your-extended-api-key-here
EXTENDED_SECRET_KEY=your-extended-secret-key-here
EXTENDED_STARK_PRIVATE_KEY=your-stark-private-key-here
EXTENDED_ENVIRONMENT=testnet

# Optional: Database (if not using Supabase)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/astrade
```

> **💡 Development Tip:** For local development, you can use placeholder values for the Extended/StarkNet keys. The backend will start but trading features won't work without real credentials.

---

### **Step 4: Start the Backend**

**Option 1: Using the run script (recommended)**
```bash
# Activate venv if not already active
source venv/bin/activate

# Run the backend
python run.py run
```

**Option 2: Using uvicorn directly**
```bash
# Activate venv if not already active
source venv/bin/activate

# Run with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option 3: Using Docker**
```bash
# Start using Docker
docker-compose up -d

# View logs
docker-compose logs -f api
```

---

### **Step 5: Verify It's Working**

✅ **If the backend started correctly, you should see:**

```
✅ Loaded environment from .env
✅ All dependencies installed
🚀 Starting AsTrade Backend
📍 Environment: testnet
🌐 Server: http://0.0.0.0:8000
📚 Docs: http://0.0.0.0:8000/docs
INFO: Application startup complete.
```

🔍 **Test the backend:**

1. **Open in browser:** http://localhost:8000/docs
   - You should see the interactive Swagger API documentation

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"ok"}
   ```

3. **Check integration status:**
   ```bash
   curl http://localhost:8000/api/v1/users/integration/status
   ```

---

### **Common Issues & Solutions**

❌ **Problem:** `AssertionError` with SQLAlchemy
- **Solution:** Make sure you have SQLAlchemy >= 2.0.43
  ```bash
  pip install --upgrade sqlalchemy
  ```

❌ **Problem:** `Missing required environment variables: EXTENDED_SECRET_PUBLIC_KEY`
- **Solution:** Add the variable to your `.env` file (can use a placeholder for dev)

❌ **Problem:** `psycopg2-binary` build fails
- **Solution:** Install the pre-built version for Python 3.13:
  ```bash
  pip install psycopg2-binary==2.9.10
  ```

---

### **Useful Commands**

```bash
# Stop the backend (Ctrl+C if running in foreground)

# Using Docker:
docker-compose down              # Stop
docker-compose build --no-cache  # Rebuild
docker-compose logs -f           # View logs

# Run tests
./test_docker.sh
```

---

## 🎯 **Next Steps**

- Explore the API documentation at http://localhost:8000/docs
- Check out the [Endpoints documentation](docs/ENDPOINTS.md)
- Review the [Backend Structure](docs/BACKEND_STRUCTURE_ANALYSIS.md)

---

**✅ Your backend is now running at `http://localhost:8000`**
