from quart import jsonify
import httpx
import asyncio

async def chatpage_controller(data):
    session = data.get("session")
    if not session:
        return jsonify({"status": "error", "message": "Session is required"})

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:4004/chat-page",
            json={"session": session}
        )
        resp = response.json()  # httpx allows this synchronously
        # print("hey this is the resp i got --- ")
        # print(resp)

        if resp.get("status") == "error":
            return jsonify({"status": "error", "message": resp.get("message")})

        return jsonify({
            "status": "success",
            "message": "Bot page details fetched successfully",
            "data": resp.get("data")
        })
