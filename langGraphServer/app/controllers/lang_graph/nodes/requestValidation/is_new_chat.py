from flask import jsonify
from ...state import State , flagState , inputState
from ..agents.set_agents import is_redis_memory_not_created

async def is_new_chat(state : inputState) -> str:
    
    try : 
        if(state.status != "success") :
            return "error"
        
        flag = await is_redis_memory_not_created(str(state.chat_session) , state.user_session)
        
        if(state.is_new_chat == True and flag):
            print("yes uh tha")
            return "yes"
        else :
            print("no tha")
            return "no"

    except Exception as e : 
        print("inga tha error")
        print(e)
        return "error"
    
    
def is_new_chat_wrapper(state: flagState) -> inputState:
    if(state.status != "success") :
        return state
    return {
        "message" : "Checking if this is a new chat request"
    }