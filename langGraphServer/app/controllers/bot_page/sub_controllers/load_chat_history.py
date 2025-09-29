from quart import jsonify
import httpx
import asyncio

async def load_chat_history_controller(data):
    session = data.get("session")
    chat_id = data.get("chat_id")
    if not session:
        return jsonify({"status": "error", "message": "Session is required"})
    
    if not chat_id:
        return jsonify({"status": "error", "message": "Chat ID is required... entha chat oda history da venum ebba "})
    
    async with httpx.AsyncClient() as client:
        response = await client.post("http://localhost:4007/load-chat-history", json={"session": session})
        resp = response.json()
        # print("hey this is the resp i got --- ")
        # print(resp)
        if resp["status"] == "error":
            return jsonify({"status": "error", "message": resp["message"]})
        return jsonify({"status": "success", "message": "Bot page details fetched successfully", "data": resp["data"]})
        
        
