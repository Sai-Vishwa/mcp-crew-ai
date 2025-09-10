from flask import jsonify
import httpx
from ...lang_graph import Workflow , toolCallInfo , State
from ..agents.set_agents import CustomRedisClass , is_redis_memory_empty
from langchain.schema import HumanMessage, AIMessage

async def load_memory(state : State) :
    
    try :
        
        user_session = state.user_session
        chat_session = state.chat_session
        
        async with httpx.AsyncClient() as client:
                    
            response = await client.post("http://localhost:4004/verify_user_session_and_load_memory", json={"user_session" : user_session , "chat_session" : chat_session})
            resp = response.json()
            
            if resp["status"] == "error":
                return {
                    "status" : "error" , 
                    "message" : "Cannot validate the user session and load the memory" , 
                    "answer" : "no",
                    "state" : state ,
                }
            
            new_mmy = CustomRedisClass(
                user_session= user_session , 
                chat_session= chat_session 
            )
            
            
            data = resp["data"]
            
            for row in data : 
                new_mmy.add_messages([HumanMessage(content=row["ques"])])
                new_mmy.add_messages([AIMessage(content=row["workflow"])])
                
            state.is_memory_loaded = True
            
            return {
                "status" : "success" , 
                "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                "answer" : "yes" , 
                "state" : state , 
            }
            
    except Exception as e :
        
      return {
          "status" : "error" , 
          "message" : "Some internal error happened while loading the memory" , 
          "answer" : "no"
      }