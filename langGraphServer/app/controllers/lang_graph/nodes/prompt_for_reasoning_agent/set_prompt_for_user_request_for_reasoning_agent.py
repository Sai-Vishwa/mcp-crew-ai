from ...state import ReasoningAgentInputState , FlagState
import tiktoken
from .set_prompt_template_for_reasoning_agent import expose_chat_prompt_template_for_reasoning_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage , HumanMessage , AIMessage
from ..tools.set_tools import expose_tools
async def set_prompt_for_user_request_for_reasoning_agent(state : ReasoningAgentInputState) -> FlagState : 
    
    try :
        
        
        print("NA IPO THA PROMPT EH SET PANREN")
        print(state.additional_messages_for_reasoning_agent)
        
        chat_prompt_template : ChatPromptTemplate = expose_chat_prompt_template_for_reasoning_agent()
        
        history = []
        
        for msg in state.history_messages : 
            
            history.append(HumanMessage(content=msg.user_message))
            history.append(AIMessage(content=msg.ai_message.model_dump_json(exclude_none=True)))
        
        relevant_workflow = []
        
        for workflow in state.relevant_workflows : 
            
            relevant_workflow.append(HumanMessage(workflow.user_message))
            relevant_workflow.append(AIMessage(content=workflow.ai_message.model_dump_json(exclude_none=True)))
                  
        
        summary_msg = [HumanMessage (content=f"Summary: {state.summary}")]
        
        Tools = expose_tools()
        
        tools_str = "\n".join([f"{tool.name}: {tool.description}" for tool in Tools])

        tools = [SystemMessage (content="TOOLS AVAILABLE -> "+tools_str)]
        
        additional_system_message = [SystemMessage(content=state.additional_messages_for_reasoning_agent)]
    
        
        final_prompt = chat_prompt_template.format(
            user_input = state.user_input , 
            history_messages = history, 
            summary = summary_msg,
            tools = tools,
            relevant_prompts = relevant_workflow,
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
            "message" : "prompt is generated successfully for the reasoning agent",
            "prompt_for_reasoning_agent" : final_prompt
        }
        
    except Exception as e :
         
        print("tho paaru na")
        print(e)
        return {
            "status" : "error",
            "message" : "cannot generate a proper prompt for the user request for the reasoning agent"
        }