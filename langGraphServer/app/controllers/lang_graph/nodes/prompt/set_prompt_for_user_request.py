from ...state import ReasoningAgentInputState , FlagState
import tiktoken
from .set_prompt_template import expose_chat_prompt_template
from langchain_core.prompts import ChatPromptTemplate

async def set_prompt_for_user_request(state : ReasoningAgentInputState) -> FlagState : 
    
    try :
        
        chat_prompt_template : ChatPromptTemplate = expose_chat_prompt_template()
        
        message_history = [message.model_dump_json(exclude_none=True) for message in state.history_messages]
        
        message_history_str = "[" + ",".join(message_history) + "]"       
        
        relevant_workflow = [workflow.model_dump_json(exclude_none=True) for workflow in state.relevant_workflows]
        
        relevant_workflow_str = "[" + ",".join(relevant_workflow) + "]"       
        
        final_prompt = chat_prompt_template.format(
            user_input = state.user_input , 
            history_messages = message_history_str + "summary" + state.summary , 
            relecant_prompts = relevant_workflow_str
        )

        
        return {
            "status" : "success" , 
            "message" : "prompt is generated successfully",
            "prompt" : final_prompt
        }
        
    except Exception as e :
         
        print(e)
        return {
            "status" : "error",
            "message" : "cannot generate a proper prompt for the user request"
        }