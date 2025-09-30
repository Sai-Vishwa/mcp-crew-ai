from ...state import FlagState , ReasoningAgentResponseState
from pprint import pprint

def error_checker(state : FlagState) -> str :
    
    try : 
        
        pprint("\n\n====================================================\n\n")
        pprint("state inside error checker")
        pprint(state)
        print("\n\n=====================================================\n\n")
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