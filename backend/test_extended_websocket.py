#!/usr/bin/env python3
"""
Test script for Extended Exchange WebSocket mark price stream
Tests the connection to wss://api.starknet.extended.exchange/stream.extended.exchange/v1/prices/mark/{market}
"""

import asyncio
import json
import websockets
import structlog

logger = structlog.get_logger()

async def test_extended_mark_price_stream(symbol: str = "BTC-USD"):
    """Test connection to Extended Exchange mark price WebSocket stream"""
    
    # Build WebSocket URL based on the documentation
    ws_url = f"wss://api.starknet.extended.exchange/stream.extended.exchange/v1/prices/mark/{symbol}"
    
    logger.info(f"Testing Extended Exchange mark price stream", symbol=symbol, url=ws_url)
    
    try:
        # Connect to Extended Exchange WebSocket
        async with websockets.connect(ws_url) as websocket:
            logger.info(f"Connected to Extended Exchange mark price stream for {symbol}")
            
            # Listen for messages
            message_count = 0
            max_messages = 10  # Limit for testing
            
            async for message in websocket:
                try:
                    data = json.loads(message)
                    message_count += 1
                    
                    logger.info(f"Received mark price update #{message_count}", 
                              data=data,
                              message_type=data.get("type"),
                              market=data.get("data", {}).get("m") if "data" in data else None,
                              price=data.get("data", {}).get("p") if "data" in data else None)
                    
                    # Check if this is a mark price message
                    if data.get("type") == "MP" and "data" in data:
                        mark_data = data["data"]
                        logger.info(f"Mark price for {mark_data.get('m')}: {mark_data.get('p')}")
                    
                    # Stop after receiving enough messages
                    if message_count >= max_messages:
                        logger.info(f"Received {max_messages} messages, stopping test")
                        break
                        
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse message: {e}", message=message)
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    
    except websockets.exceptions.ConnectionClosed as e:
        logger.error(f"WebSocket connection closed: {e}")
    except websockets.exceptions.WebSocketException as e:
        logger.error(f"WebSocket error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")

async def test_all_markets():
    """Test mark price stream for multiple markets"""
    markets = ["BTC-USD", "ETH-USD", "STRK-USD"]
    
    for market in markets:
        logger.info(f"Testing mark price stream for {market}")
        try:
            await test_extended_mark_price_stream(market)
        except Exception as e:
            logger.error(f"Failed to test {market}: {e}")
        
        # Wait between tests
        await asyncio.sleep(2)

async def main():
    """Main test function"""
    logger.info("Starting Extended Exchange WebSocket mark price stream test")
    
    # Test single market first
    await test_extended_mark_price_stream("BTC-USD")
    
    # Uncomment to test multiple markets
    # await test_all_markets()
    
    logger.info("Test completed")

if __name__ == "__main__":
    asyncio.run(main())
