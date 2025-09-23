import httpx
from ...state import InputState , ReasoningAgentInputState , FlagState
import sys
import os
from dotenv import load_dotenv

load_dotenv()

async def load_relevant_workflows(state : InputState) -> FlagState:
    
    # CHANGES
    
    try: 
        
        async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/load_relevant_workflows", json={"user_session" : state.user_session , "chat_session" : state.chat_session , "ques" : state.user_input , "lang_graph_server_secret" : os.getenv("MASTER_PASSWORD")})
                resp = response.json()
                print("the resp i got from db server")
                print(resp)
                
                print("CHAT SESSION IS ==" , state.chat_session)
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot fetch relevant workflows" , 
                    }
                
                data = resp["data"]
                
                
                
                relevant_workflows = [] 
                
                # logic to set relevant workflows ( json conversion )
                
                return {
                    "status" : "success" , 
                    "message" : resp["message"],
                    "relevant_workflows" : relevant_workflows,
                    "is_relevant_inputs_loaded" : True,
                    "user_input" : state.user_input,
                    "additional_message_for_reasoning_agent" : "",
                    "chat_session" : state.chat_session
                }
        
    except Exception as e :
        
        print("controlling the ketta vaarthai")
        print(e)
        
        return {
            "status" : "error" , 
            "message" : "some internal error occured while fetching relevant workflows"
        }