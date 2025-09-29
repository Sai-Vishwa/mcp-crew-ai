from quart import jsonify
import httpx
import asyncio
import json

async def login_controller(data):
    uname = data.get("username")
    pwd = data.get("password")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:4004/login",
            json={"username": uname, "password": pwd}
        )
        resp = response.json()  # ok for httpx, no need to await
        # print("hey this is the resp i got --- ")
        # print(resp)

        if resp.get("status") == "error":
            return jsonify({"status": "error", "message": resp.get("message")})
        # handle success
        return jsonify({"status": "success", "data": resp})
