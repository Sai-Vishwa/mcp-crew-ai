from flask import jsonify
import httpx
from ...state import State
from ..agents.set_agents import CustomRedisClass , is_redis_memory_not_created
from langchain.schema import HumanMessage, AIMessage
import sys
import os
from dotenv import load_dotenv

load_dotenv()


async def is_valid_user_session_for_old_chat(state : State) : 
    try :
        
        user_session = state.user_session
        chat_session = str(state.chat_session)
        
        mmy = CustomRedisClass(
            user_session=user_session, 
            chat_session=chat_session,
            session_id=chat_session
        )
        value =  mmy.redis_client.get(chat_session+"MeowDass")
        # print("value va paara == ")
        # print(value)
        if(value and mmy.user_session == value ):
            
            
            return {
                "status" : "success" , 
                "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                "is_memory_loaded" : True
            }
        
        elif(value is None) :
             
            async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/verify_user_session_and_load_memory", json={"user_session" : user_session , "chat_session" : chat_session , "ques" : state.user_input , "lang_graph_server_secret" : os.getenv("MASTER_PASSWORD") , "ques" : state.user_input})
                resp = response.json()
                
                # print("response ah paaru")
                # print(resp)
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot validate the user session and load the memory" , 
                    }
                
                mmy.redis_client.setex(chat_session+"MeowDass" , 900 , user_session)
                
                # print("ra ta ta... ra ta ta ...")


                data = resp["data"]
                
                for row in data : 
                    mmy.add_messages([HumanMessage(content=row["ques"])])
                    mmy.add_messages([AIMessage(content=row["workflow"])])
                    
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                    "is_memory_loaded" : True
                }
        
        else : 
            
            async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/verify_user_session", json={"user_session" : user_session , "chat_session" : chat_session})
                resp = response.json()
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot validate the user session" ,
                    }
                
                mmy.redis_client.setex(chat_session+"MeowDass" , 900 , user_session)
             
                    
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                    "is_memory_loaded" : True,
                    "user_input_id" : resp["user_input_id"],
                }
    
    except Exception as e :
        
        # print("enna da un prechana")
        # print(e)
        
        return {
          "status" : "error" , 
          "message" : "Some internal error happened while validating user request" , 
      }
    