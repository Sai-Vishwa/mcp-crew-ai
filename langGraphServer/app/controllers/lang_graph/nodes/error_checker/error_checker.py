from ...state import FlagState , ReasoningAgentResponseState

def error_checker(state : FlagState) -> str :
    
    try : 
        
        if(state.status != 'success') : 
            return "error"
        
        return "success"
    
    except Exception as e : 
        
        print("ithu la enna da error varum")
        print(e)
        
        return "error"
    
def error_checker_wrapper(state : FlagState) -> FlagState : 
    return state

def error_checker_last_wrapper(state : FlagState) -> ReasoningAgentResponseState :
    return state