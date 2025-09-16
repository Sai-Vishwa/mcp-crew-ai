from ...state import State
from ..agents.set_agents import is_redis_memory_not_created

async def is_memory_loaded(state : State) -> str : 
    try : 
        
        if(state.status != "success"):
            return "error"
        
        if(state.is_memory_loaded == True and not( is_redis_memory_not_created(str(state.chat_session ), state.user_session))):
            return "yes"
                    
        else :
            return "no"
        
    except Exception as e:
        print("ayayo")
        print(e)
        return "error"
    
def is_memory_loaded_wrapper(state: State) :
    state.message = "Checking if the memory is loaded"
    return state