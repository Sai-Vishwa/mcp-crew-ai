from flask import jsonify
import httpx
from ...lang_graph import Workflow , toolCallInfo , State
from ..agents.set_agents import store

async def is_new_chat(state : State):
    
    try : 
        
        if(state.is_new_chat == True and store.get(state.chat_session) is None) :
            return {
                "status" : "success" , 
                "message" : "yes the chat session is new" , 
                "answer" : "yes"
            }
        else :
             return {
                "status" : "success" , 
                "message" : "no the chat session is not new" , 
                "answer" : "no"
            }

    except Exception as e : 
        return {
            "status" : "error" , 
            "message" : "internal error happened while identifying a new chat"
        }