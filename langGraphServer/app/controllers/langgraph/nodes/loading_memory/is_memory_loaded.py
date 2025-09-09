from ...lang_graph import Workflow , toolCallInfo , State
from ..agents.set_agents import store

async def is_memory_loaded(state : State) : 
    try : 
        if(state.is_memory_loaded == True and store.get(state.chat_session) is not None) : 
            return {
                "status" : "success", 
                "message" : "The memory is successfully loaded",
                "answer" : "yes"
            }
        else :
            return {
                "status" : "success", 
                "message" : "The memory is not loaded",
                "answer" : "no"
            }
    except Exception as e:
        return {
                "status" : "error", 
                "message" : "Encountered error while verifying memory status",
                "answer" : "no"
            }