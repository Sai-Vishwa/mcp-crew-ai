from ...state import FlagState , ReasoningAgentResponseState , DefaultReplyAgentResponseState , DeciderAgentResponseState
from pprint import pprint

def error_checker(state : FlagState) -> str :
    
    try : 
        
        # pprint("\n\n====================================================\n\n")
        # pprint("state inside error checker")
        # pprint(state)
        # print("\n\n=====================================================\n\n")
        if(state.status == 'success') : 
            return "success"
        
        if(state.status == "reinvoke") : 
            return "reinvoke"
        
        return "error"
    
    except Exception as e : 
        
        # print("ithu la enna da error varum")
        # print(e)
        
        return "error"
    
def error_checker_wrapper(state : FlagState) -> FlagState : 
    return state

def error_checker_last_wrapper_for_reasoning_agent(state : FlagState) -> ReasoningAgentResponseState :
    return state


def error_checker_last_wrapper_for_default_reply_agent(state : FlagState) ->  DefaultReplyAgentResponseState:
    return state

def error_checker_last_wrapper_for_decider_agent(state : FlagState) -> DeciderAgentResponseState :
    return state