from ...state import FlagState
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    AIMessagePromptTemplate,
    MessagesPlaceholder
)
import aiofiles
import asyncio

chat_prompt_template : ChatPromptTemplate | None = None


async def set_prompt_template(state : FlagState) -> FlagState:
    
    try : 
        
        global chat_prompt_template
        
        system_message_str = ""
        
        async with aiofiles.open("lang_graph/nodes/prompt/reasoning_agent_developer_prompt.txt" ,mode="r" , encoding="utf-8") as f :
            system_message_str =  await f.read()

        system_message = SystemMessagePromptTemplate(system_message_str)
        
        current_user_message = HumanMessagePromptTemplate("{user_input}")
        
        history_messages = MessagesPlaceholder(variable_name="history_messages")
        
        relevant_prompts = MessagesPlaceholder(variable_name="relevant_prompts")
        
        chat_prompt_template = ChatPromptTemplate.from_messages([
            system_message , current_user_message , history_messages , relevant_prompts
        ])
        
        return {
            "status" : "success", 
            "message" : "Chat prompt template is set successfully"
        }
        
    except Exception as e : 
        
        print(e)
        return {
            "status" : "error" , 
            "message" : "cannot set the chat prompt template"
        }
    
    
def expose_chat_prompt_template():
    return chat_prompt_template