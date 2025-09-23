import httpx
from ...state import InputState , ReasoningAgentInputState , FlagState , SingleRelevantWorkflowFormat
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
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot fetch relevant workflows" , 
                    }
                
                data = resp["data"]
                
                List = []
                
                for i in data : 
                    
                    workflow = SingleRelevantWorkflowFormat(**i)
                    List.append(workflow)
                    
                return {
                    "status" : "success" , 
                    "message" : resp["message"],
                    "relevant_workflows" : List,
                }
        
    except Exception as e :
        
        
        return {
            "status" : "error" , 
            "message" : "some internal error occured while fetching relevant workflows"
        }