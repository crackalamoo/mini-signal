import asyncio
import websockets
import json

CONNECTIONS = set()
USERS = {}

async def handler(websocket):
    CONNECTIONS.add(websocket)
    username = None
    async for message in websocket:
        message = json.loads(message)
        if message['type'] == 'msg':
            for connection in CONNECTIONS:
                await connection.send(json.dumps(message))
        elif message['type'] == 'login':
            username = message['user']
            USERS[message['user']] = {
                'pk_n': message['pk_n'],
                'pk_e': message['pk_e']
            }
        elif message['type'] == 'connect':
            if message['to'] in USERS:
                await websocket.send(json.dumps({
                    'type': 'connected',
                    'to': message['to'],
                    'pk_n': USERS[message['to']]['pk_n'],
                    'pk_e': USERS[message['to']]['pk_e']
                }))
    CONNECTIONS.remove(websocket)
    for connection in CONNECTIONS:
        await connection.send(json.dumps({
            'type': 'disconnected',
            'user': username
        }))
    await websocket.close()
        

async def main():
    async with websockets.serve(handler, '', 8000):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())