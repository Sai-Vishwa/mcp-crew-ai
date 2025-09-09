from flask import jsonify
import httpx
from ...lang_graph import Workflow , toolCallInfo , State
from ..agents.set_agents import store

async def is_new_chat(state : State) -> str:
    
    try : 
        
        if(state.status != "success") :
            return "error"
        
        if(state.is_new_chat == True and store.get(state.chat_session) is None) :
            return "yes"
        else :
             return "no"

    except Exception as e : 
        return "error"