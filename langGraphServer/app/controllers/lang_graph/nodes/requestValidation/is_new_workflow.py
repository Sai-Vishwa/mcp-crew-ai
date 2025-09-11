from ...state import State,ReasoningAgentResponse

async def is_new_workflow(state : State) -> str:
    try : 
        if(state.status != "success"):
            return "error"
        
        if(type(state.reasoning_agent_response) == str):
            return "error"
        
        if(type(state.reasoning_agent_response)==ReasoningAgentResponse and state.reasoning_agent_response.is_new_workflow==True):
            return "yes"
        else : 
            return "no"
        
    except Exception as e:
        return "error"
    
def is_new_workflow_wrapper(state: State) :
    return state