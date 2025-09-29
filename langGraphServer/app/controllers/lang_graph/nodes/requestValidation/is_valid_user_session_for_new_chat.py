import httpx
from ...state import InputState , FlagState
import os
from dotenv import load_dotenv

load_dotenv()

async def is_valid_user_session_for_new_chat(state : InputState) -> FlagState:
    
    try :
        
        user_session = state.user_session
        
        lang_graph_server_secret = os.getenv("MASTER_PASSWORD")
        
        async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/verify_user_session_and_create_new_chat", json={"user_session" : user_session , "lang_graph_server_secret" : lang_graph_server_secret , "ques" : state.user_input})
                resp = response.json()
                
                if resp["status"] == "error":
                    # print(resp)
                    return {
                        "status" : "error" , 
                        "message" : "Cannot create a new chat session for the user" , 
                    }
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and a new chat memory is created for the user",
                    "user_input_id" : resp["user_input_id"],
                    "chat_session" : resp["chatid"],
                    "user_name" : resp["uname"]
                }
                
    except Exception as e :
        print("enna da prechana")
        print(e)
        
        return {
          "status" : "error" , 
          "message" : "Some internal error happened while validating the user and creating a new chat for the user" , 
        }