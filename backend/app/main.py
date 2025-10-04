"""FastAPI application with Supabase integration"""
import structlog
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.users.routes import router as users_router
from app.api.v1.markets.routes import router as markets_router
from app.api.v1.orders.routes import router as orders_router
from app.api.v1.accounts.routes import router as accounts_router
from app.api.v1.stark.routes import router as stark_router
from app.api.v1.planets.routes import router as planets_router
from app.api.v1.rewards.routes import router as rewards_router
from app.api.v1.rewards.upload_routes import router as upload_router
from app.services.database import check_supabase_connection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

# Configure structlog
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    # Startup
    logger.info("Starting AsTrade API")
    
    # Check database connection
    success, message = await check_supabase_connection()
    if success:
        logger.info("Database connection successful")
    else:
        logger.error("Database connection failed", error=message)
    
    yield
    
    # Shutdown
    logger.info("Shutting down AsTrade API")

app = FastAPI(
    title="AsTrade API",
    description="Backend API for AsTrade platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Register routers
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(markets_router, prefix="/api/v1/markets", tags=["markets"])
app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(accounts_router, prefix="/api/v1/account", tags=["accounts"])
app.include_router(stark_router, prefix="/api/v1/stark", tags=["stark-trading"])
app.include_router(planets_router, prefix="/api/v1/planets", tags=["planets"])
app.include_router(rewards_router, prefix="/api/v1/rewards", tags=["rewards"])
app.include_router(upload_router, prefix="/api/v1/rewards", tags=["rewards"])

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Check database connection
    success, message = await check_supabase_connection()
    
    return {
        "status": "healthy" if success else "unhealthy",
        "database": {
            "connected": success,
            "message": message
        }
    } 