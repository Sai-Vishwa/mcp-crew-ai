from flask import jsonify
import httpx
from ...lang_graph import Workflow , toolCallInfo , State
from ..agents.set_agents import store , MemoryClass
from langchain.schema import HumanMessage, AIMessage
from langchain_community.chat_message_histories import RedisChatMessageHistory


async def is_valid_user_session_for_new_chat(state : State) :
    try :
        
        user_session = state.user_session
        
        async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/verify_user_session_and_create_new_chat", json={"user_session" : user_session})
                resp = response.json()
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot create a new chat session for the user" , 
                        "answer" : "no",
                        "state" : state , 
                        "store" : store
                    }
                
                new_mmy = MemoryClass()
                
                new_mmy.user_session = user_session
                new_mmy.chat_session = resp["chat_session"]
                new_mmy.user_name = resp["user_name"]
                
                
                    
                store[resp["chat_session"]] = new_mmy
                state.is_memory_loaded = True
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and a new chat memory is created for the user",
                    "answer" : "yes" , 
                    "state" : state , 
                    "store" : store
                }
    except Exception as e :
        return {
          "status" : "error" , 
          "message" : "Some internal error happened while validating the user and creating a new chat for the user" , 
          "answer" : "no"
        }