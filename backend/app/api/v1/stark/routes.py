"""Stark trading endpoints"""
from fastapi import APIRouter, WebSocket, Query, HTTPException
from typing import Optional, List
import structlog
import httpx

from app.models.responses import SuccessResponse
from app.api.v1.stark.models import (
    StarkOrderRequest,
    StarkOrderCancelRequest,
    StarkOrderResponse,
    StarkOrderCancelResponse,
    StarkAccountInfoResponse,
    StarkPositionResponse,
    StarkOrderDetailResponse
)
from app.api.v1.stark.service import (
    create_stark_order,
    cancel_stark_order,
    get_stark_account_info,
    initialize_stark_client,
    get_stark_positions,
    get_stark_orders
)
from app.services.price_streaming_service import (
    price_streaming_service,
    handle_price_stream_websocket
)

logger = structlog.get_logger()
router = APIRouter()


@router.post("/orders", response_model=SuccessResponse, summary="Create Stark order")
async def create_order(
    order_request: StarkOrderRequest
):
    """
    Create a new Stark perpetual trading order.
    
    Args:
        order_request: Order creation request with all order parameters
    
    Returns:
        Created order information with order ID and status
    
    This endpoint allows you to place orders on Stark perpetual markets.
    The order will be executed using the configured Stark account credentials.
    
    Example request:
    ```json
    {
        "amount_of_synthetic": "0.0001",
        "price": "100000.1", 
        "market_name": "BTC-USD",
        "side": "BUY",
        "post_only": false
    }
    ```
    """
    result = await create_stark_order(order_request)
    return SuccessResponse(data=result.dict())


@router.delete("/orders/{order_external_id}", response_model=SuccessResponse, summary="Cancel Stark order")
async def cancel_order(
    order_external_id: str
):
    """
    Cancel an existing Stark order by its external ID.
    
    Args:
        order_external_id: The external ID of the order to cancel
    
    Returns:
        Cancellation status and result information
    
    This endpoint allows you to cancel a previously placed order using its external ID.
    """
    cancel_request = StarkOrderCancelRequest(order_external_id=order_external_id)
    result = await cancel_stark_order(cancel_request)
    return SuccessResponse(data=result.dict())


@router.post("/orders/cancel", response_model=SuccessResponse, summary="Cancel Stark order (POST)")
async def cancel_order_post(
    cancel_request: StarkOrderCancelRequest
):
    """
    Cancel an existing Stark order using POST method.
    
    Args:
        cancel_request: Order cancellation request with external ID
    
    Returns:
        Cancellation status and result information
    
    Alternative endpoint for cancelling orders using POST method.
    """
    result = await cancel_stark_order(cancel_request)
    return SuccessResponse(data=result.dict())


@router.get("/positions", response_model=SuccessResponse, summary="Get user positions")
async def get_positions(
    market: Optional[str] = Query(None, description="Market filter (e.g., BTC-USD)")
):
    logger.info("Positions endpoint called", market=market)
    """
    Get user positions from Stark perpetual trading.
    
    Args:
        market: Optional market filter to get positions for a specific market
    
    Returns:
        List of user positions with detailed information
    
    This endpoint retrieves all open positions for the user account.
    Each position includes information about size, leverage, PnL, and risk management settings.
    
    Example response:
    ```json
    {
        "status": "success",
        "data": [
            {
                "id": 1,
                "accountId": 1,
                "market": "BTC-USD",
                "side": "LONG",
                "leverage": "10",
                "size": "0.1",
                "value": "4000",
                "openPrice": "39000",
                "markPrice": "40000",
                "liquidationPrice": "38200",
                "margin": "20",
                "unrealisedPnl": "1000",
                "realisedPnl": "1.2",
                "tpTriggerPrice": "41000",
                "tpLimitPrice": "41500",
                "slTriggerPrice": "39500",
                "slLimitPrice": "39000",
                "adl": "2.5",
                "maxPositionSize": "0.2",
                "createdTime": 1701563440000,
                "updatedTime": 1701563440
            }
        ]
    }
    ```
    """
    positions = await get_stark_positions(market=market)
    return SuccessResponse(data=[position.dict() for position in positions])


@router.get("/orders", response_model=SuccessResponse, summary="Get user orders")
async def get_orders(
    market: Optional[str] = Query(None, description="Market filter (e.g., BTC-USD)"),
    type: Optional[str] = Query(None, description="Order type filter (LIMIT, CONDITIONAL, TPSL)"),
    side: Optional[str] = Query(None, description="Order side filter (BUY, SELL)")
):
    logger.info("Orders endpoint called", market=market, order_type=type, side=side)
    """
    Get user orders from Stark perpetual trading.
    
    Args:
        market: Optional market filter to get orders for a specific market
        type: Optional order type filter
        side: Optional order side filter
    
    Returns:
        List of user orders with detailed information
    
    This endpoint retrieves all orders for the user account, including open, filled, and cancelled orders.
    Each order includes information about status, quantity, price, and execution details.
    
    Example response:
    ```json
    {
        "status": "success",
        "data": [
            {
                "id": 1775511783722512384,
                "accountId": 3017,
                "externalId": "2554612759479898620327573136214120486511160383028978112799136270841501275076",
                "market": "ETH-USD",
                "type": "LIMIT",
                "side": "BUY",
                "status": "PARTIALLY_FILLED",
                "statusReason": null,
                "price": "3300",
                "averagePrice": "3297.00",
                "qty": "0.2",
                "filledQty": "0.1",
                "payedFee": "0.0120000000000000",
                "reduceOnly": false,
                "postOnly": false,
                "createdTime": 1701563440000,
                "updatedTime": 1701563440000,
                "timeInForce": "FOK",
                "expireTime": 1712754771819
            }
        ]
    }
    ```
    """
    orders = await get_stark_orders(market=market, order_type=type, side=side)
    return SuccessResponse(data=[order.dict() for order in orders])


@router.get("/account", response_model=SuccessResponse, summary="Get Stark account info")
async def get_account_info():
    """
    Get Stark account information and status.
    
    Returns:
        Account information including vault ID, public key, and initialization status
    
    This endpoint provides information about the configured Stark trading account,
    including whether the client has been initialized.
    """
    result = await get_stark_account_info()
    return SuccessResponse(data=result.dict())


@router.post("/client/initialize", response_model=SuccessResponse, summary="Initialize Stark client")
async def initialize_client():
    """
    Initialize the Stark trading client.
    
    Returns:
        Initialization status and result
    
    This endpoint initializes the Stark trading client with the configured credentials.
    It's automatically called when placing orders, but can be called manually to test connectivity.
    """
    result = await initialize_stark_client()
    return SuccessResponse(data=result)


@router.get("/health", response_model=SuccessResponse, summary="Stark trading health check")
async def health_check():
    """
    Health check endpoint for Stark trading functionality.
    
    Returns:
        Health status of the Stark trading service
    
    This endpoint checks the status of the Stark trading service and client configuration.
    """
    try:
        account_info = await get_stark_account_info()
        from app.services.extended_websocket_service import extended_websocket_service
        price_health = await extended_websocket_service.health_check()
        
        return SuccessResponse(data={
            "status": "healthy",
            "service": "stark_trading",
            "account_configured": account_info.vault is not None,
            "client_initialized": account_info.initialized,
            "extended_websocket_service": price_health
        })
    except Exception as e:
        logger.error("Stark trading health check failed", error=str(e))
        return SuccessResponse(data={
            "status": "unhealthy",
            "service": "stark_trading",
            "error": str(e)
        })


@router.websocket("/stream/prices/{symbol}")
async def websocket_price_stream(websocket: WebSocket, symbol: str):
    """
    WebSocket endpoint for real-time mark price streaming from Extended Exchange.
    
    Args:
        websocket: WebSocket connection
        symbol: Trading symbol (e.g., BTC-USD)
    
    This endpoint provides real-time mark price updates from Extended Exchange.
    Mark prices are used for P&L calculations and serve as liquidation reference.
    Clients will receive updates whenever the mark price changes.
    
    Example usage:
    ```javascript
    const ws = new WebSocket('ws://localhost:8000/api/v1/stark/stream/prices/BTC-USD');
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Mark price update:', data);
    };
    ```
    
    Message format:
    ```json
    {
        "type": "mark_price_update",
        "symbol": "BTC-USD",
        "price": 100250.50,
        "mark_price": 100250.50,
        "timestamp": 1701563440000,
        "sequence": 1,
        "source_event_id": null,
        "formatted_timestamp": "2024-01-01T12:00:00.000Z"
    }
    ```
    """
    await handle_price_stream_websocket(websocket, symbol)


@router.get("/stream/prices/{symbol}/current", response_model=SuccessResponse, summary="Get current mark price")
async def get_current_price(symbol: str):
    """
    Get the current mark price for a symbol from Extended Exchange.
    
    Args:
        symbol: Trading symbol (e.g., BTC-USD)
    
    Returns:
        Current mark price data if available
    
    This endpoint returns the last known mark price from Extended Exchange.
    Mark prices are used for P&L calculations and liquidation reference.
    If no price data is available, it will return null.
    """
    try:
        from app.services.extended_websocket_service import extended_websocket_service
        current_price = await extended_websocket_service.get_current_mark_price(symbol)
        return SuccessResponse(data=current_price)
    except Exception as e:
        logger.error("Failed to get current mark price", symbol=symbol, error=str(e))
        return SuccessResponse(data=None, message=f"Failed to get mark price for {symbol}")


@router.post("/stream/start/{symbol}", response_model=SuccessResponse, summary="Start mark price streaming")
async def start_price_streaming(symbol: str):
    """
    Manually start mark price streaming for a symbol from Extended Exchange.
    
    Args:
        symbol: Trading symbol (e.g., BTC-USD)
    
    Returns:
        Status of the streaming service
    
    This endpoint can be used to pre-warm the mark price streaming service
    before clients connect via WebSocket.
    """
    try:
        from app.services.extended_websocket_service import extended_websocket_service
        success = await extended_websocket_service.connect_to_mark_price_stream(symbol)
        return SuccessResponse(data={
            "symbol": symbol,
            "streaming": success,
            "message": f"Extended Exchange mark price streaming {'started' if success else 'failed'} for {symbol}"
        })
    except Exception as e:
        logger.error("Failed to start mark price streaming", symbol=symbol, error=str(e))
        return SuccessResponse(data={
            "symbol": symbol,
            "streaming": False,
            "error": str(e)
        })


@router.get("/candles/{market}/{candle_type}", response_model=SuccessResponse, summary="Get historical candles")
async def get_historical_candles(
    market: str,
    candle_type: str,
    interval: str = Query(..., description="Time interval (e.g., PT1M, PT5M, PT15M, PT1H)"),
    limit: int = Query(20, description="Number of candles to return (max 100)"),
    end_time: Optional[int] = Query(None, description="End timestamp in milliseconds")
):
    """
    Get historical candle data from Extended Exchange.
    
    Args:
        market: Trading market (e.g., BTC-USD, ETH-USD)
        candle_type: Type of candle data (mark-prices, trades, index-prices)
        interval: Time interval between candles
        limit: Maximum number of candles to return
        end_time: End timestamp in milliseconds (optional)
    
    Returns:
        Historical candle data from Extended Exchange
    
    This endpoint fetches historical OHLC candle data from Extended Exchange.
    It serves as a proxy to avoid CORS issues when accessing Extended Exchange API directly from the browser.
    
    Example usage:
    GET /api/v1/stark/candles/BTC-USD/mark-prices?interval=PT1M&limit=20
    
    Example response:
    ```json
    {
        "status": "success",
        "data": {
            "status": "OK",
            "data": [
                {
                    "o": "65206.2",
                    "l": "65206.2", 
                    "h": "65206.2",
                    "c": "65206.2",
                    "v": "0.0",
                    "T": 1715797320000
                }
            ]
        }
    }
    ```
    """
    try:
        # Validate candle_type
        valid_types = ["mark-prices", "trades", "index-prices"]
        if candle_type not in valid_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid candle_type. Must be one of: {', '.join(valid_types)}"
            )
        
        # Validate interval
        valid_intervals = ["PT1M", "PT5M", "PT15M", "PT30M", "PT1H", "PT4H", "PT24H", "P7D", "P30D"]
        if interval not in valid_intervals:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid interval. Must be one of: {', '.join(valid_intervals)}"
            )
        
        # Limit the number of candles to prevent abuse
        if limit > 100:
            limit = 100
        
        # Build the Extended Exchange API URL
        base_url = "https://api.starknet.extended.exchange/api/v1/info/candles"
        url = f"{base_url}/{market}/{candle_type}"
        
        # Build query parameters
        params = {
            "interval": interval,
            "limit": limit
        }
        
        if end_time:
            params["endTime"] = end_time
        
        logger.info(
            "Fetching historical candles from Extended Exchange",
            market=market,
            candle_type=candle_type,
            interval=interval,
            limit=limit,
            end_time=end_time,
            url=url
        )
        
        # Make request to Extended Exchange
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(
                    "Successfully fetched historical candles",
                    market=market,
                    candle_type=candle_type,
                    candle_count=len(data.get("data", []))
                )
                return SuccessResponse(data=data)
            else:
                logger.error(
                    "Failed to fetch historical candles from Extended Exchange",
                    market=market,
                    candle_type=candle_type,
                    status_code=response.status_code,
                    response_text=response.text
                )
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Extended Exchange API error: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("Timeout fetching historical candles", market=market, candle_type=candle_type)
        raise HTTPException(status_code=504, detail="Timeout fetching data from Extended Exchange")
    except httpx.RequestError as e:
        logger.error("Request error fetching historical candles", market=market, candle_type=candle_type, error=str(e))
        raise HTTPException(status_code=502, detail=f"Error connecting to Extended Exchange: {str(e)}")
    except Exception as e:
        logger.error("Unexpected error fetching historical candles", market=market, candle_type=candle_type, error=str(e))
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") 