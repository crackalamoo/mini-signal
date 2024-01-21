import asyncio
import websockets
import json

CONNECTIONS = set()

async def handler(websocket):
    CONNECTIONS.add(websocket)
    async for message in websocket:
        print("RECEIVED MESSAGE")
        print(message)
        for connection in CONNECTIONS:
            await connection.send(json.dumps(message))

async def main():
    async with websockets.serve(handler, '', 8000):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())