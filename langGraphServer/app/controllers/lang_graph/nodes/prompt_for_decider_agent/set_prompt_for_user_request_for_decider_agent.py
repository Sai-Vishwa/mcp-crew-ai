from ...state import ReasoningAgentInputState , FlagState , DeciderAgentInputState
import tiktoken
from .set_prompt_template_for_decider_agent import expose_chat_prompt_template_for_decider_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage , HumanMessage , AIMessage
from ..tools.set_tools import expose_tools

async def set_prompt_for_user_request_for_decider_agent(state : DeciderAgentInputState) -> FlagState : 
    
    try :
        
        
        # print("NA IPO THA PROMPT EH SET PANREN")
        # print(state.additional_messages_for_decider_agent)
        
        chat_prompt_template_for_decider_agent : ChatPromptTemplate = expose_chat_prompt_template_for_decider_agent()
        
        history = []
        
        for msg in state.history_messages : 
            
            history.append(HumanMessage(content=msg.user_message))
            history.append(AIMessage(content=msg.ai_message.model_dump_json(exclude_none=True)))
        
        
                
        Tools = expose_tools()
        
        tools_str = "\n".join([f"{tool.name}: {tool.description}" for tool in Tools])

        tools = [SystemMessage (content="TOOLS AVAILABLE -> "+tools_str)]
        
        additional_system_message = [SystemMessage(content=state.additional_messages_for_decider_agent)]
    
        
        final_prompt = chat_prompt_template_for_decider_agent.format(
            user_input = state.user_input , 
            history_messages = history, 
            tools = tools,
            additional_system_message = additional_system_message
        )

        # print("tho paara prompt uh ---> ")
        # print()
        # print()
        # print(final_prompt)
        # print()
        # print()
        return {
            "status" : "success" , 
            "message" : "prompt is generated successfully for the decider agent",
            "prompt_for_decider_agent" : final_prompt
        }
        
    except Exception as e :
         
        print("tho paaru na")
        print(e)
        return {
            "status" : "error",
            "message" : "cannot generate a proper prompt for the user request for the decider agent"
        }