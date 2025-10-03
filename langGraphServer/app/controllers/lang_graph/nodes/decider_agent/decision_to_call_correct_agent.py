from ...state import DeciderAgentResponseState , FlagState

async def decision_to_call_correct_agent(state : DeciderAgentResponseState) -> str : 
    
    try : 
        
        if(state.formatted_response_from_decider_agent == "DIRECT") : 
            return "DIRECT" 
        
        elif (state.formatted_response_from_decider_agent == "REASONING") : 
            return "REASONING"
        
        return "ERROR"
    
    except Exception as e :
        
        return "ERROR"
    
async def decision_to_call_correct_agent_wrapper(state : FlagState) -> DeciderAgentResponseState : 
    
    if(state.status != "success") : 
        
        return state
    
    return {
        "status" : state.status , 
        "message" : "Choosing correct agent"
    }