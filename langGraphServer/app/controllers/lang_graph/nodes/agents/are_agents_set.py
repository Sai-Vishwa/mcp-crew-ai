from .set_agents import expose_all
from ...state import FlagState

async def are_agents_set(state : FlagState) -> str:
    try: 
        agents = expose_all()
        reasoning_agent = agents["reasoning_agent"]
        reasoning_agent_with_memory = agents["reasoning_agent_with_memory"]
        dev_prompt_reasoning_agent = agents["dev_prompt_reasoning_agent"]
        dev_prompt_execution_agent = agents["dev_prompt_execution_agent"]
        llm = agents["llm"]
        execution_agent = agents["execution_agent"]
        
        if(state.status != "success") :
            return "error"
        
        if(reasoning_agent_with_memory is None or reasoning_agent is None or dev_prompt_execution_agent is None or execution_agent is None or llm is None or dev_prompt_reasoning_agent is None):
            return "no"
            
        else:
            return "yes"
            
    except Exception as e:
        print(e)
        return  "error"
    
def are_agents_set_wrapper(state: FlagState) -> FlagState:
    
    if(state.status != "success") :
        return state
    return {
        "message" : "Checking if agents are set"
    }