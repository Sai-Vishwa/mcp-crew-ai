from ...state import ReasoningAgentInputState , FlagState , DeciderAgentInputState , DefaultReplyAgentInputState
from ..agents.set_agents import expose_default_reply_agent
import json
from langchain.agents import AgentExecutor


async def invoke_decider_agent(state : DefaultReplyAgentInputState) -> FlagState   :

    try : 
        
        print("ENNA EVAN DA KOOPTUNE IRUKAN")
        
        print("Additional message ah paaru da ---> ")
        
        print(state.additional_messages_for_default_reply_agent)
        
        default_reply_agent_with_memory = expose_default_reply_agent()
        
    
        final_prompt = state.prompt_for_default_reply_agent
        
        print("aivoke is getting called")
    

        
        outcome = await default_reply_agent_with_memory.ainvoke(
            {"input" : final_prompt} , 
            config= {"configurable" : {"session_id" : str(state.user_input_id)}}
        )
        
        print("THO PAARU OUTCOME AH --->>")
        
        print(outcome)

        print(type(outcome))
                
        return {
            "status" : "success" , 
            "message" : "default reply agent responded for the user request",
            "raw_response_from_default_reply_agent" : outcome
        }
        
    except Exception as e:
        print("default reply agent call la prechana")
        print(e)
        return {
            "status" : "error" , 
            "message" : "Some error occured while calling_the_DECIDER_AGENT",
            "raw_response_from_default_reply_agent" : "Thothukitte irukiye da"
        }