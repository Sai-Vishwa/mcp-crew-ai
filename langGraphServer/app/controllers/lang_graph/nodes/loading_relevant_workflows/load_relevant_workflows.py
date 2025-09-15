import httpx
from ...state import State
import sys
import os
from dotenv import load_dotenv

load_dotenv()

async def load_relevant_workflows(state : State) :
    
    try: 
        
        async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/load_relevant_workflows", json={"user_session" : state.user_session , "chat_session" : state.chat_session , "ques" : state.user_input , "lang_graph_server_secret" : os.getenv("MASTER_PASSWORD")})
                resp = response.json()
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot fetch relevant workflows" , 
                    }
                
                data = resp["data"]
                
                relevant_workflows = {}
                
                # logic to set relevant workflows ( json conversion )
                
                return {
                    "status" : "success" , 
                    "message" : "The user session is valid and a new chat memory is created for the user",
                    "relevant_workflows" : relevant_workflows,
                    "is_relevant_inputs_loaded" : True
                }
        
    except Exception as e :
        
        print("controlling the ketta vaarthai")
        print(e)
        
        return {
            "status" : "error" , 
            "message" : "some internal error occured while fetching relevant workflows"
        }