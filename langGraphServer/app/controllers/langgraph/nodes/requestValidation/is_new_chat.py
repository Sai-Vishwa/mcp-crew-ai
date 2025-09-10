from flask import jsonify
from ...lang_graph import State
from ..agents.set_agents import is_redis_memory_not_created

async def is_new_chat(state : State) -> str:
    
    try : 
        
        if(state.status != "success") :
            return "error"
        
        if(state.is_new_chat == True and is_redis_memory_not_created(state.chat_session)) :
            return "yes"
        else :
             return "no"

    except Exception as e : 
        return "error"