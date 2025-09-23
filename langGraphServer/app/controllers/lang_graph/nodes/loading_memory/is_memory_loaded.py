from ...state import FlagState , InputState
from ..helpers.redis_connector import async_redis_client_provider

async def is_memory_loaded(state : InputState) -> str : 
    try : 

        if(state.is_new_chat == True) : 
            return "no"
        
        async_client = await async_redis_client_provider()
        
        is_memory_present = await async_client.execute_command('JSON.GET' , str(state.chat_session)+"MeowMemory" , "$")
        
        if(is_memory_present) : 
            return "yes"
        
        else : 
            return "no"
        
    except Exception as e:
        print("ayayo")
        print(e)
        return "error"
    
def is_memory_loaded_wrapper(state: FlagState) -> InputState:
    if(state.status != "success") :
        return state
    return {
        "message" : "Checking if memory is loaded"
    }