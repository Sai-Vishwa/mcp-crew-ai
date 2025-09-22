from flask import jsonify
import httpx
from ...state import State , loaderState , inputState
from ..agents.set_agents import CustomRedisClass , is_redis_memory_not_created , CustomClassTry
from langchain.schema import HumanMessage, AIMessage

async def load_memory(state : loaderState) -> loaderState:
    
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
                }
            
            new_mmy = await CustomClassTry.create_memory(
                user_session= user_session , 
                chat_session= chat_session ,
                session_id= chat_session
            )
            
            await new_mmy.redis_client.setex(chat_session+"MeowDass" , 900 , user_session )
            
            data = resp["data"]
            
            for row in data : 
                
                await new_mmy.aadd_message([HumanMessage(content=row["ques"])])
                await new_mmy.aadd_message([AIMessage(content=row["workflow"])])
                            
            return {
                "status" : "success" , 
                "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                "is_memory_loaded" : True,
                "user_input_id" : resp["user_input_id"],
                "user_name" : resp["user_name"]
            }
            
    except Exception as e :
        
      return {
          "status" : "error" , 
          "message" : "Some internal error happened while loading the memory" , 
      }