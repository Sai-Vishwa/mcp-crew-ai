from flask import jsonify
import httpx
import asyncio

async def login(data):
    uname = data.get("username")
    pwd = data.get("password")
    
    async with httpx.AsyncClient() as client:
        response = await client.post("http://localhost:4007/login", json={"username": uname, "password": pwd})
        resp = response.json()
        if resp.status == "error":
            return jsonify({"status": "error", "message": resp.message})
        return jsonify({"status": "success" , "message": "Login successful", "session": resp.session})