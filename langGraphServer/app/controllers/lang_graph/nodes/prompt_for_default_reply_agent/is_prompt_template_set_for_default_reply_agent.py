from .set_prompt_template_for_default_reply_agent import expose_chat_prompt_template_for_default_reply_agent
from ...state import FlagState

async def is_prompt_template_set_for_default_reply_agent(state : FlagState) -> str:
    try: 
        
        chat_prompt_template = expose_chat_prompt_template_for_default_reply_agent()

        
        if(state.status != "success") :
            return "error"
        
        if(chat_prompt_template is None):
            return "no"
            
        else:
            return "yes"
            
    except Exception as e:
        print(e)
        return  "error"
    
def is_prompt_template_set_for_default_reply_agent_wrapper(state: FlagState) -> FlagState:
    
    if(state.status != "success") :
        return state
    return {
        "message" : "Checking if prompt template is set for the default reply agent" , 
        "status" : state.status
    }