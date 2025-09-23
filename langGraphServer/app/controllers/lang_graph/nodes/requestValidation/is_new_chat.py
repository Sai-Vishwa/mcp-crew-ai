from flask import jsonify
from ...state import FlagState , InputState
from ..agents.set_agents import is_redis_memory_not_created

async def is_new_chat(state : InputState) -> str:
    
    try : 
        
        if(state.is_new_chat == True and state.chat_session == -1):
            print("yes uh tha")
            return "yes"
        else :
            print("no tha")
            return "no"

    except Exception as e : 
        print("inga tha error")
        print(e)
        return "error"
    
    
def is_new_chat_wrapper(state: FlagState) -> InputState:
    if(state.status != "success") :
        return state
    return {
        "message" : "Checking if this is a new chat request"
    }