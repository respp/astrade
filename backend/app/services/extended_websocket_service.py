"""
Extended Exchange WebSocket Service for Real-time Mark Price Streaming
Connects to wss://api.starknet.extended.exchange/stream.extended.exchange/v1/prices/mark/{market}
"""

import asyncio
import json
import logging
from datetime import datetime
from decimal import Decimal
from typing import Dict, Set, Optional, Callable, Any
from dataclasses import dataclass

import structlog
import websockets
from fastapi import WebSocket
from websockets.exceptions import ConnectionClosed, WebSocketException

from app.config.extended_config import extended_config

logger = structlog.get_logger()

@dataclass
class MarkPriceUpdate:
    """Mark price update from Extended Exchange"""
    type: str  # "MP" for mark price
    market: str
    price: Decimal
    timestamp: int  # Epoch milliseconds
    sequence: int
    source_event_id: Optional[int] = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary format for WebSocket clients"""
        return {
            "type": "mark_price_update",
            "symbol": self.market,
            "price": float(self.price),
            "mark_price": float(self.price),
            "timestamp": self.timestamp,
            "sequence": self.sequence,
            "source_event_id": self.source_event_id,
            "formatted_timestamp": datetime.fromtimestamp(self.timestamp / 1000).isoformat()
        }

class ExtendedWebSocketService:
    """Service for connecting to Extended Exchange WebSocket streams"""
    
    def __init__(self):
        self.config = extended_config
        self.connections: Dict[str, Set[WebSocket]] = {}
        self.stream_connections: Dict[str, websockets.WebSocketClientProtocol] = {}
        self.current_prices: Dict[str, MarkPriceUpdate] = {}
        self.is_running = False
        self.reconnect_delay = 5  # seconds
        
    async def connect_to_mark_price_stream(self, symbol: str) -> bool:
        """Connect to Extended Exchange mark price stream for a symbol"""
        try:
            # Build WebSocket URL
            ws_url = f"{self.config.ws_url}/prices/mark/{symbol}"
            
            logger.info(f"Connecting to Extended Exchange mark price stream", symbol=symbol, url=ws_url)
            
            # Connect to Extended Exchange WebSocket
            websocket = await websockets.connect(
                ws_url,
                extra_headers=self.config.headers
            )
            
            self.stream_connections[symbol] = websocket
            logger.info(f"Connected to mark price stream for {symbol}")
            
            # Start listening for messages
            asyncio.create_task(self._listen_to_mark_price_stream(symbol, websocket))
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to mark price stream for {symbol}: {e}")
            return False
    
    async def _listen_to_mark_price_stream(self, symbol: str, websocket: websockets.WebSocketClientProtocol):
        """Listen to mark price stream messages from Extended Exchange"""
        try:
            async for message in websocket:
                try:
                    # Parse Extended Exchange message format
                    data = json.loads(message)
                    
                    # Handle mark price message format:
                    # {
                    #   "type": "MP",
                    #   "data": {
                    #     "m": "BTC-USD",
                    #     "p": "25670",
                    #     "ts": 1701563440000
                    #   },
                    #   "ts": 1701563440000,
                    #   "seq": 1,
                    #   "sourceEventId": null
                    # }
                    
                    if data.get("type") == "MP" and "data" in data:
                        mark_price_data = data["data"]
                        
                        # Create mark price update
                        mark_price_update = MarkPriceUpdate(
                            type=data["type"],
                            market=mark_price_data["m"],
                            price=Decimal(mark_price_data["p"]),
                            timestamp=data["ts"],
                            sequence=data.get("seq", 0),
                            source_event_id=data.get("sourceEventId")
                        )
                        
                        # Store current price
                        self.current_prices[symbol] = mark_price_update
                        
                        # Broadcast to all connected WebSocket clients
                        await self._broadcast_mark_price_update(symbol, mark_price_update)
                        
                        logger.debug(f"Mark price update for {symbol}: {mark_price_update.price}")
                        
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse WebSocket message: {e}")
                except Exception as e:
                    logger.error(f"Error processing mark price message: {e}")
                    
        except ConnectionClosed:
            logger.warning(f"Mark price stream connection closed for {symbol}")
        except WebSocketException as e:
            logger.error(f"WebSocket error for {symbol}: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in mark price stream for {symbol}: {e}")
        finally:
            # Clean up connection
            if symbol in self.stream_connections:
                del self.stream_connections[symbol]
            
            # Attempt to reconnect after delay
            await asyncio.sleep(self.reconnect_delay)
            if symbol in self.connections and self.connections[symbol]:
                logger.info(f"Attempting to reconnect mark price stream for {symbol}")
                await self.connect_to_mark_price_stream(symbol)
    
    async def _broadcast_mark_price_update(self, symbol: str, mark_price_update: MarkPriceUpdate):
        """Broadcast mark price update to all connected WebSocket clients"""
        if symbol not in self.connections:
            return
            
        message = json.dumps(mark_price_update.to_dict())
        disconnected_clients = set()
        
        for websocket in self.connections[symbol]:
            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.warning(f"Failed to send mark price update to client: {e}")
                disconnected_clients.add(websocket)
        
        # Remove disconnected clients
        for websocket in disconnected_clients:
            self.connections[symbol].discard(websocket)
    
    async def add_websocket_connection(self, websocket: WebSocket, symbol: str):
        """Add a WebSocket connection for a symbol"""
        await websocket.accept()
        
        if symbol not in self.connections:
            self.connections[symbol] = set()
            
        self.connections[symbol].add(websocket)
        
        # Start mark price stream if not already running
        if symbol not in self.stream_connections:
            await self.connect_to_mark_price_stream(symbol)
        
        logger.info(f"Added WebSocket connection for {symbol}")
    
    async def remove_websocket_connection(self, websocket: WebSocket, symbol: str):
        """Remove a WebSocket connection"""
        if symbol in self.connections:
            self.connections[symbol].discard(websocket)
            
            # Stop mark price stream if no more connections
            if not self.connections[symbol] and symbol in self.stream_connections:
                try:
                    await self.stream_connections[symbol].close()
                    del self.stream_connections[symbol]
                    logger.info(f"Stopped mark price stream for {symbol} (no more connections)")
                except Exception as e:
                    logger.warning(f"Error stopping mark price stream for {symbol}: {e}")
        
        logger.info(f"Removed WebSocket connection for {symbol}")
    
    async def get_current_mark_price(self, symbol: str) -> Optional[dict]:
        """Get the current mark price for a symbol"""
        if symbol in self.current_prices:
            return self.current_prices[symbol].to_dict()
        return None
    
    async def health_check(self) -> dict:
        """Health check for the Extended WebSocket service"""
        return {
            "status": "healthy" if self.is_running else "stopped",
            "extended_ws_available": True,
            "active_streams": list(self.stream_connections.keys()),
            "total_connections": sum(len(conns) for conns in self.connections.values()),
            "current_mark_prices": {symbol: float(price.price) for symbol, price in self.current_prices.items()}
        }
    
    async def stop_all_streams(self):
        """Stop all mark price streams"""
        for symbol, websocket in self.stream_connections.items():
            try:
                await websocket.close()
            except Exception as e:
                logger.warning(f"Error closing mark price stream for {symbol}: {e}")
        
        self.stream_connections.clear()
        self.connections.clear()
        self.current_prices.clear()
        self.is_running = False
        
        logger.info("Stopped all Extended Exchange mark price streams")

# Global instance
extended_websocket_service = ExtendedWebSocketService()
