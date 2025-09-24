from .set_prompt_template import expose_chat_prompt_template
from ...state import FlagState

async def is_prompt_template_set(state : FlagState) -> str:
    try: 
        
        chat_prompt_template = expose_chat_prompt_template()

        
        if(state.status != "success") :
            return "error"
        
        if(chat_prompt_template is None):
            return "no"
            
        else:
            return "yes"
            
    except Exception as e:
        print(e)
        return  "error"
    
def is_prompt_template_set_wrapper(state: FlagState) -> FlagState:
    
    if(state.status != "success") :
        return state
    return {
        "message" : "Checking if prompt template is set"
    }