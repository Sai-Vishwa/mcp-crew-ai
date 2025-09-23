from flask import jsonify
import httpx
from ...state import InputState , FlagState
from ..agents.set_agents import CustomRedisClass , is_redis_memory_not_created , CustomClassTry
from langchain.schema import HumanMessage, AIMessage
import sys
import os
from dotenv import load_dotenv

load_dotenv()


async def is_valid_user_session_for_old_chat(state : InputState) -> FlagState: 
    try :
        
            user_session = state.user_session
            
            chat_session = state.chat_session
            
            async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/verify_user_session_for_the_chat_session", json={"user_session" : user_session , "chat_session" : chat_session})
                resp = response.json()
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot validate the user session" ,
                    }
                                    
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                    "user_input_id" : resp["user_input_id"] ,
                    "user_name" : resp["user_name"]
                }
    
    except Exception as e :
        
        return {
          "status" : "error" , 
          "message" : "Some internal error happened while validating user request" , 
      }
    