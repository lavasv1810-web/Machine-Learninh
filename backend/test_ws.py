import asyncio
import websockets

async def test_ws():
    try:
        async with websockets.connect("ws://localhost:8000/ws/attack-stream") as websocket:
            print("Connected!")
            while True:
                msg = await websocket.recv()
                print("Received:", msg)
    except Exception as e:
        print("Error:", e)

asyncio.run(test_ws())
