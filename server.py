import asyncio
import websockets
import json
from websockets.exceptions import ConnectionClosedOK

CONNECTIONS = set()
USERS = {}

async def handler(websocket):
    CONNECTIONS.add(websocket)
    async for message in websocket:
        print("RECEIVED MESSAGE")
        message = json.loads(message)
        print(message)
        if message['type'] == 'msg':
            for connection in CONNECTIONS:
                await connection.send(json.dumps(message))
        elif message['type'] == 'login':
            USERS[message['user']] = {
                'pk_n': message['pk_n'],
                'pk_e': message['pk_e']
            }
        elif message['type'] == 'connect':
            await websocket.send(json.dumps({
                'type': 'connected',
                'to': message['to'],
                'pk_n': USERS[message['to']]['pk_n'],
                'pk_e': USERS[message['to']]['pk_e']
            }))
        

async def main():
    async with websockets.serve(handler, '', 8000):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())