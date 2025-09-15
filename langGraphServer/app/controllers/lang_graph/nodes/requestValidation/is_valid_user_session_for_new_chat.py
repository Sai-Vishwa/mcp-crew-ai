from flask import jsonify
import httpx
from ...state import Workflow , toolCallInfo , State
from ..agents.set_agents import CustomRedisClass , is_redis_memory_not_created
import sys
import os
from dotenv import load_dotenv

load_dotenv()


async def is_valid_user_session_for_new_chat(state : State) :
    try :
        
        user_session = state.user_session
        
        lang_graph_server_secret = os.getenv("MASTER_PASSWORD")
        
        async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/verify_user_session_and_create_new_chat", json={"user_session" : user_session , "lang_graph_server_secret" : lang_graph_server_secret})
                resp = response.json()
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot create a new chat session for the user" , 
                    }
                
                new_mmy = CustomRedisClass(
                    session_id=resp["session_id"],
                    user_session=user_session,
                    chat_session=resp["chat_session"]
                )
                new_mmy.redis_client.setex(resp["chat_session"]+"MeowDass" , 900 , user_session)
                
                    
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and a new chat memory is created for the user",
                    "is_memory_loaded" : True
                }
    except Exception as e :
        return {
          "status" : "error" , 
          "message" : "Some internal error happened while validating the user and creating a new chat for the user" , 
        }