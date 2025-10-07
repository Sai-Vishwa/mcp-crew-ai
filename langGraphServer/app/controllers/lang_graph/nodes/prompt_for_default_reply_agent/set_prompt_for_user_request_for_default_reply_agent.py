from ...state import ReasoningAgentInputState , FlagState , DefaultReplyAgentInputState
import tiktoken
from .set_prompt_template_for_default_reply_agent import expose_chat_prompt_template_for_default_reply_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage , HumanMessage , AIMessage

async def set_prompt_for_user_request_for_default_reply_agent(state : DefaultReplyAgentInputState) -> FlagState : 
    
    try :
        
        
        # print("NA IPO THA PROMPT EH SET PANREN")
        # print(state.additional_messages_for_default_reply_agent)
        
        chat_prompt_template_for_default_reply_agent : ChatPromptTemplate = expose_chat_prompt_template_for_default_reply_agent()
        
        history = []
        
        for msg in state.history_messages : 
            
            history.append(HumanMessage(content=msg.user_message))
            history.append(AIMessage(content=msg.ai_message.model_dump_json(exclude_none=True)))
        
 
        additional_system_message = [SystemMessage(content=state.additional_messages_for_default_reply_agent)]
    
        summary = [SystemMessage(content=state.summary)]

        final_prompt = chat_prompt_template_for_default_reply_agent.format(
            user_input = state.user_input , 
            history_messages = history, 
            additional_system_message = additional_system_message,
            summary = summary
        )

        # print("tho paara prompt uh ---> ")
        # print()
        # print()
        # print(final_prompt)
        # print()
        # print()
        return {
            "status" : "success" , 
            "message" : "prompt is generated successfully for the default reply agent",
            "prompt_for_default_reply_agent" : final_prompt
        }
        
    except Exception as e :
         
        # print("tho paaru na")
        # print(e)
        return {
            "status" : "error",
            "message" : "cannot generate a proper prompt for the user request for the default reply agent"
        }