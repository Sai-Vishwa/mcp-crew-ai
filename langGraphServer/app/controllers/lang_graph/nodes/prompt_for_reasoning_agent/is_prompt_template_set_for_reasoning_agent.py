from .set_prompt_for_user_request_for_reasoning_agent import expose_chat_prompt_template_for_reasoning_agent
from ...state import FlagState

async def is_prompt_template_set_for_reasoning_agent(state : FlagState) -> str:
    try: 
        
        chat_prompt_template = expose_chat_prompt_template_for_reasoning_agent()

        
        if(state.status != "success") :
            return "error"
        
        if(chat_prompt_template is None):
            return "no"
            
        else:
            return "yes"
            
    except Exception as e:
        print(e)
        return  "error"
    
def is_prompt_template_set_wrapper_for_reasoning_agent(state: FlagState) -> FlagState:
    
    if(state.status != "success") :
        return state
    return {
        "message" : "Checking if prompt template is set for the reasoning agent" , 
        "status" : state.status
    }