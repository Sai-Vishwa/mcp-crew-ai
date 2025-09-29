from flask import jsonify
import httpx
import asyncio

async def chatpage_controller(data):
    session = data.get("session")
    if not session:
        return jsonify({"status": "error", "message": "Session is required"})
    
    async with httpx.AsyncClient() as client:
        response = await client.post("http://localhost:4007/chat-page", json={"session": session})
        resp = response.json()
        # print("hey this is the resp i got --- ")
        # print(resp)
        if resp["status"] == "error":
            return jsonify({"status": "error", "message": resp["message"]})
        return jsonify({"status": "success", "message": "Bot page details fetched successfully", "data": resp["data"]})
        
        
