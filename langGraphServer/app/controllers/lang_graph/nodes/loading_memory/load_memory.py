from flask import jsonify
import httpx
from ...state import InputState , ReasoningAgentInputState , FlagState
from langchain.schema import HumanMessage, AIMessage
from ..helpers.redis_connector import async_redis_client_provider
import json

async def load_memory(state : InputState) -> FlagState:
    
    try :
        
        
        user_session = state.user_session
        chat_session = state.chat_session
        
        if(state.is_new_chat == True) : 
            
            async_redis_client = await async_redis_client_provider()
            
            memory_object = ReasoningAgentInputState(
                user_input_id= state.user_input_id , 
                chat_session= chat_session , 
                history_messages= [],
                summary= "",
            )
            
            await async_redis_client.execute_command("JSON.SET" , str(chat_session)+"MeowMemory" , "$" , memory_object.model_dump_json(exclude_none=True))
            
            await async_redis_client.expire(str(chat_session)+"MeowMWmory" , 900)
            
            
            return {
                "status" : "success" , 
                "message" : "as this is a new chat , a new memory instance is set in redis" , 
                "user_input_id" : state.user_input_id , 
                "chat_session" : chat_session , 
                "history_messages" : [] , 
                "summary" : "" , 
                "relevant_workflows" : []
            }
        
        else : 
            
            async with httpx.AsyncClient() as client:
                    
                response = await client.post("http://localhost:4004/load_memory", json={"user_session" : user_session , "chat_session" : chat_session})
                resp = response.json()
                
                if(resp["status"] != "success") : 
                    
                    return {
                        "status" : "error" , 
                        "message" : "some internal error happened while loading the existing memory"
                    }
                
                data = resp["data"]
            
                memory_object = ReasoningAgentInputState(**data)
                
                async_redis_client = await async_redis_client_provider()
                
                await async_redis_client.execute_command("JSON.SET" , str(chat_session)+"MeowMemory" , "$" , memory_object.model_dump_json(exclude_none=True))
                
                await async_redis_client.expire(str(chat_session)+"MeowMemory" , 900)
                
                return {
                    "status" : "success" , 
                    "message" : "Chat memory is loaded successfully",
                    **data
                }  
                
    except Exception as e :
        
      print(e)
        
      return {
          "status" : "error" , 
          "message" : "Some internal error happened while loading the memory" , 
      }