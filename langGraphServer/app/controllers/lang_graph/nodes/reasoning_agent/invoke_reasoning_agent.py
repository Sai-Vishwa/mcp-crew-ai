from ...state import State
from ..agents.set_agents import reasoning_agent_with_memory
from ..tools.set_tools import Tools
import json

async def invoke_reasoning_agent(state : State):
    
    try : 
        
        user_prompt = state.user_input    
        tools_str = "\n".join([f"{tool.name}: {tool.description}" for tool in Tools])
        relevant_workflows_str = json.dumps(state.relevant_workflows)
        
        final_prompt = user_prompt + '''
        TOOLS AVALABLE -
        ''' + tools_str + '''
        APPROVED WORKFLOWS FOR REFERENCE
        ''' + relevant_workflows_str
        
        outcome = await reasoning_agent_with_memory.ainvoke(
            {"input" : final_prompt} , 
            config= {"configurable" : {"session_id" : state.chat_session}}
        )
        
        return {
            "status" : "success" , 
            "message" : "Reasoning agent predicted the workflow",
            "reasoning_agent_response" : outcome
        }
        
    except Exception as e:
        return {
            "status" : "error" , 
            "message" : "Some error occured while calling the reasoning agent",
            "reasoning_agent_response" : "Thothukitte irukiye da"
        }