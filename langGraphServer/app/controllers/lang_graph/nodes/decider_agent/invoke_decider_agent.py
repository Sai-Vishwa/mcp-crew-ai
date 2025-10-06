from ...state import ReasoningAgentInputState , FlagState , DeciderAgentInputState
from ..agents.set_agents import expose_decider_agent
from ..tools.set_tools import expose_tools
import json
from langchain.agents import AgentExecutor


async def invoke_decider_agent(state : DeciderAgentInputState) -> FlagState   :

    try : 
        
        print("ENNA EVAN DA KOOPTUNE IRUKAN")
        
        print("Additional message ah paaru da ---> ")
        
        print(state.additional_messages_for_decider_agent)
        
        decider_agent_with_memory = expose_decider_agent()
        Tools = expose_tools()
        
    
        final_prompt = state.prompt_for_decider_agent
        
        print("aivoke is getting called")
        
        # agent_executor = AgentExecutor.from_agent_and_tools(
        #     agent=decider_agent_with_memory,
        #     tools=Tools,
        #     handle_parsing_errors=True
        # )

        
        outcome = await decider_agent_with_memory.ainvoke(
            {"input" : final_prompt} , 
            config= {"configurable" : {"session_id" : str(state.user_input_id)}}
        )
        
        print("THO PAARU OUTCOME AH --->>")
        
        print(outcome)

        print(type(outcome))
                
        return {
            "status" : "success" , 
            "message" : "Reasoning agent predicted the workflow",
            "raw_response_from_decider_agent" : outcome
        }
        
    except Exception as e:
        print("decider agent call la prechana")
        print(e)
        return {
            "status" : "error" , 
            "message" : "Some error occured while calling_the_DECIDER_AGENT",
            "raw_response_from_decider_agent" : "Thothukitte irukiye da"
        }