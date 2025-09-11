from .set_agents import reasoning_agent , reasoning_agent_with_memory , dev_prompt_reasoning_agent , dev_prompt_execution_agent , llm , execution_agent
from ...state import State

async def are_agents_set(state : State) -> str:
    try: 
        
        if(state.status != "success") :
            return "error"
        
        if(reasoning_agent_with_memory is None or reasoning_agent is None or dev_prompt_execution_agent is None or execution_agent is None or llm is None or dev_prompt_reasoning_agent is None):
            return "no"
            
        else:
            return "yes"
            
    except Exception as e:
        return  "error"
    
def are_agents_set_wrapper(state: State) :
    return state