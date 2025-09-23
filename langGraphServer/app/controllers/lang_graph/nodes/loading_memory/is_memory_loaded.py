from ...state import FlagState
from ..agents.set_agents import is_redis_memory_not_created

async def is_memory_loaded(state : FlagState) -> str : 
    try : 
        
        if(state.status != "success"):
            return "error"
        
        # CHANGES
        
        if(state.is_memory_loaded == True and not(await is_redis_memory_not_created(str(state.chat_session ), state.user_session))):
            return "yes"
                    
        else :
            return "no"
        
    except Exception as e:
        print("ayayo")
        print(e)
        return "error"
    
def is_memory_loaded_wrapper(state: FlagState) -> FlagState:
    if(state.status != "success") :
        return state
    return {
        "message" : "Checking if memory is loaded"
    }