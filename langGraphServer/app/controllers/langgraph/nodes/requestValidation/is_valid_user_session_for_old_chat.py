from flask import jsonify
import httpx
from ...lang_graph import Workflow , toolCallInfo , State
from ..agents.set_agents import store , MemoryClass
from langchain.schema import HumanMessage, AIMessage


async def is_valid_user_session_for_old_chat(state : State) : 
    try :
        
        user_session = state.user_session
        chat_session = state.chat_session
        
        mmy : MemoryClass | None = store.get(chat_session)
        
        if(type(mmy)==MemoryClass and mmy.chat_session == chat_session and mmy.user_session == user_session):
            
            state.is_memory_loaded = True
            
            return {
                "status" : "success" , 
                "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                "answer" : "yes" , 
                "state" : state , 
                "store" : store
            }
        
        elif(mmy is None) :
             
            async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/verify_user_session_and_load_memory", json={"user_session" : user_session , "chat_session" : chat_session})
                resp = response.json()
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot validate the user session and load the memory" , 
                        "answer" : "no",
                        "state" : state , 
                        "store" : store
                    }
                
                new_mmy = MemoryClass()
                
                new_mmy.user_session = user_session
                new_mmy.chat_session = chat_session
                new_mmy.user_name = resp["user_name"]
                
                data = resp["data"]
                
                for row in data : 
                    new_mmy.add_messages([HumanMessage(content=row["ques"])])
                    new_mmy.add_messages([AIMessage(content=row["workflow"])])
                    
                store[chat_session] = new_mmy
                state.is_memory_loaded = True
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                    "answer" : "yes" , 
                    "state" : state , 
                    "store" : store
                }
        
        else : 
            
            async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/verify_user_session", json={"user_session" : user_session , "chat_session" : chat_session})
                resp = response.json()
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot validate the user session" , 
                        "answer" : "no",
                        "state" : state , 
                        "store" : store
                    }
                

                if(type(mmy)==MemoryClass):
                    mmy.user_session = user_session
                    mmy.user_name = resp["user_name"]
             
                    
                state.is_memory_loaded = True
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                    "answer" : "yes" , 
                    "state" : state , 
                    "store" : store
                }
    
    except Exception as e :
        
      return {
          "status" : "error" , 
          "message" : "Some internal error happened while validating user request" , 
          "answer" : "no"
      }
    