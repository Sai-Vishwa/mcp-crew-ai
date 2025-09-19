from flask import jsonify
import httpx
from ...state import State , inputState , loaderState , flagState
from ..agents.set_agents import CustomRedisClass , is_redis_memory_not_created , CustomClassTry
from langchain.schema import HumanMessage, AIMessage
import sys
import os
from dotenv import load_dotenv

load_dotenv()


async def is_valid_user_session_for_old_chat(state : inputState) -> loaderState: 
    try :
        
        user_session = state.user_session
        chat_session = str(state.chat_session)
        
        mmy = await CustomClassTry.create_memory(
            user_session=user_session, 
            chat_session=chat_session,
            session_id=chat_session
        )
        value =  await mmy.redis_client.get(chat_session+"MeowDass")
        # print("value va paara == ")
        # print(value)
        if(value and mmy.user_session == value ):
            
            #need to save the user input in db and get the user input id and user name
            
            
            return {
                "status" : "success" , 
                "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                "is_memory_loaded" : True , 
                "is_relevant_workflow_loaded" : False , 
                "user_session" : user_session , 
                "chat_session" : chat_session ,
                "user_input_id" : "" ,
                "user_input" : state.user_input , 
                "user_name" : ""
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
                
                await mmy.redis_client.setex(chat_session+"MeowDass" , 900 , user_session)
                
                # print("ra ta ta... ra ta ta ...")


                data = resp["data"]
                
                for row in data : 
                    await mmy.aadd_messages([HumanMessage(content=row["ques"])])
                    await mmy.aadd_messages([AIMessage(content=row["workflow"])])
                    
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                    "is_memory_loaded" : True,
                    "is_relevant_workflow_loaded" : False , 
                    "user_session" : user_session , 
                    "chat_session" : chat_session ,
                    "user_input_id" : resp["user_input_id"] ,
                    "user_input" : state.user_input , 
                    "user_name" : resp["user_name"]
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
                
                await mmy.redis_client.setex(chat_session+"MeowDass" , 900 , user_session)
             
                    
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and the chat belongs to the user and the memory is loaded",
                    "is_memory_loaded" : True,
                    "is_relevant_workflow_loaded" : False , 
                    "user_session" : user_session , 
                    "chat_session" : chat_session ,
                    "user_input_id" : resp["user_input_id"] ,
                    "user_input" : state.user_input , 
                    "user_name" : resp["user_name"]
                }
    
    except Exception as e :
        
        # print("enna da un prechana")
        # print(e)
        
        return {
          "status" : "error" , 
          "message" : "Some internal error happened while validating user request" , 
      }
    