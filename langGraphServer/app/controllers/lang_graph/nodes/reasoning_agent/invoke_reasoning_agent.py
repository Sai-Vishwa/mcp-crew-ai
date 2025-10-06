from ...state import ReasoningAgentInputState , FlagState
from ..agents.set_agents import expose_reasoning_agent
from ..tools.set_tools import expose_tools
import json

async def invoke_reasoning_agent(state : ReasoningAgentInputState) -> FlagState   :

    try : 
        
        print("ENNA EVAN DA KOOPTUNE IRUKAN")
        
        print("Additional message ah paaru da ---> ")
        
        print(state.additional_messages_for_reasoning_agent)
        
        reasoning_agent_with_memory = expose_reasoning_agent()
        Tools = expose_tools()
        
        
        
        
        final_prompt = state.prompt_for_reasoning_agent
        
        # print("aivoke is getting called")
        
        outcome = await reasoning_agent_with_memory.ainvoke(
            {"input" : final_prompt} , 
            config= {"configurable" : {"session_id" : str(state.user_input_id)}}
        )
        
        return {
            "status" : "success" , 
            "message" : "Reasoning agent predicted the workflow",
            "raw_response_from_reasoning_agent" : outcome
        }
        
    except Exception as e:
        print("reasonig agent call la prechana")
        print(e)
        return {
            "status" : "error" , 
            "message" : "Some error occured while calling the reasoning agent",
            "raw_response_from_reasoning_agent" : "Thothukitte irukiye da"
        }