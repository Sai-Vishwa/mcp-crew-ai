from flask import jsonify
import httpx
from ...state import Workflow , toolCallInfo , State , inputState , flagState , loaderState
from ..agents.set_agents import CustomRedisClass , is_redis_memory_not_created , CustomClassTry
import sys
import os
from dotenv import load_dotenv

load_dotenv()


async def is_valid_user_session_for_new_chat(state : inputState) -> loaderState:
    try :
        
        user_session = state.user_session
        
        lang_graph_server_secret = os.getenv("MASTER_PASSWORD")
        
        async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/verify_user_session_and_create_new_chat", json={"user_session" : user_session , "lang_graph_server_secret" : lang_graph_server_secret , "ques" : state.user_input})
                resp = response.json()
                
                if resp["status"] == "error":
                    print(resp)
                    return {
                        "status" : "error" , 
                        "message" : "Cannot create a new chat session for the user" , 
                    }
                
                new_mmy = await CustomClassTry.create_memory(
                    session_id=resp["chatid"],
                    user_session=user_session,
                    chat_session=resp["chatid"]
                )
                
                # print("response itha")
                # print(resp)
                
                await new_mmy.redis_client.setex(str(resp["chatid"])+"MeowDass" , 900 , user_session)
                # await new_mmy.redis_client.setex(str(resp["chatid"])+"MeowDass" , 900 , user_session)
                
                    
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and a new chat memory is created for the user",
                    "is_memory_loaded" : True ,
                    "user_input_id" : resp["user_input_id"],
                    "chat_session" : str(resp["chatid"]),
                    "user_name" : resp["uname"],
                    "is_relevant_inputs_loaded" : False,
                    "user_input" : state.user_input,
                    "user_session" : state.user_session
                }
    except Exception as e :
        print("enna da prechana")
        print(e)
        
        return {
          "status" : "error" , 
          "message" : "Some internal error happened while validating the user and creating a new chat for the user" , 
        }