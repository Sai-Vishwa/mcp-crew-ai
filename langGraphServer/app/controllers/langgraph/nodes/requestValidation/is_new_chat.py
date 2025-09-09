from flask import jsonify
import httpx
from ...lang_graph import Workflow , toolCallInfo , State

async def is_new_chat(state : State):
    
    try : 
        
        if(state.is_new_chat == True):
            
             async with httpx.AsyncClient() as client:
                response = await client.post("http://localhost:4004/create-new-chat-session", json={"username": uname, "password": pwd})
                resp = response.json()
                print("hey this is the resp i got --- ")
                print(resp)
                if resp["status"] == "error":
                    return jsonify({"status": "error", "message": resp["message"]})
                return jsonify({"status": "success" , "message": "Login successful", "session": resp["session"]})
        
        
        return {
            
        }

    except Exception as e : 
        return {
            "status" : "error" , 
            "message" : "internal error happened while identifying a new chat"
        }