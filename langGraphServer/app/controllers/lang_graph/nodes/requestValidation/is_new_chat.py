from flask import jsonify
from ...state import State
from ..agents.set_agents import is_redis_memory_not_created

async def is_new_chat(state : State) -> str:
    
    try : 
        
        if(state.status != "success") :
            return "error"
        
        print("before flag")
        flag = is_redis_memory_not_created(str(state.chat_session) , state.user_session)
        print("after flag")
        
        if(state.is_new_chat == True and flag):
            print("i return yes")
            return "yes"
        else :
            print("i return no")
            return "no"

    except Exception as e : 
        print("inga paaru vro")
        print(e)
        return "error"
    
def is_new_chat_wrapper(state: State) :
    state.message = "Checking if this is a new chat request"
    return state