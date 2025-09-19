from ...state import State
from ..agents.set_agents import expose_reasoning_agent_with_memory
from ..tools.set_tools import expose_tools
import json

async def invoke_reasoning_agent(state : State):
    
    try : 
        
        reasoning_agent_with_memory = expose_reasoning_agent_with_memory()
        Tools = expose_tools()
        
        user_prompt = state.user_input    
        tools_str = "\n".join([f"{tool.name}: {tool.description}" for tool in Tools])
        relevant_workflows_str = json.dumps(state.relevant_workflows)
        
        final_prompt = state.additional_message_for_reasoning_agent + user_prompt + '''
        TOOLS AVALABLE -
        ''' + tools_str + '''
        APPROVED WORKFLOWS FOR REFERENCE
        ''' + relevant_workflows_str
        
        print("aivoke is getting called")
        
        outcome = await reasoning_agent_with_memory.ainvoke(
            {"input" : final_prompt} , 
            config= {"configurable" : {"session_id" : str(state.chat_session)}}
        )
        
        
        
        return {
            "status" : "success" , 
            "message" : "Reasoning agent predicted the workflow",
            "reasoning_agent_response" : outcome
        }
        
    except Exception as e:
        print("reasonig agent call la prechana")
        print(e)
        return {
            "status" : "error" , 
            "message" : "Some error occured while calling the reasoning agent",
            "reasoning_agent_response" : "Thothukitte irukiye da"
        }