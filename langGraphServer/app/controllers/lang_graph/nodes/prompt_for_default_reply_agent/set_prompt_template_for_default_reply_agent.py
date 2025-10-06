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


from pathlib import Path

# get path to current file
BASE_DIR = Path(__file__).parent  # points to app/controller/
file_path = BASE_DIR / "default_reply_agent_developer_prompt.txt"


chat_prompt_template_for_default_reply_agent : ChatPromptTemplate | None = None


async def set_prompt_template_for_default_reply_agent(state : FlagState) -> FlagState:
    
    try : 
        
        global chat_prompt_template_for_default_reply_agent
        
        system_message_str = ""
        
        async with aiofiles.open(file_path ,mode="r" , encoding="utf-8") as f :
            system_message_str =  await f.read()

        system_message = SystemMessagePromptTemplate.from_template(system_message_str)
        
        current_user_message = HumanMessagePromptTemplate.from_template("{user_input}")
        
        history_messages = MessagesPlaceholder(variable_name="history_messages")
                        
        additional_system_message = MessagesPlaceholder(variable_name="additional_system_message")
        
        summary = MessagesPlaceholder(variable_name="summary")

        
        chat_prompt_template_for_default_reply_agent = ChatPromptTemplate.from_messages([
            system_message , current_user_message , history_messages , additional_system_message , summary
        ])
        
        return {
            "status" : "success", 
            "message" : "Chat prompt template is set successfully for default reply agent"
        }
        
    except Exception as e : 
        
        print(e)
        return {
            "status" : "error" , 
            "message" : "cannot set the chat prompt template for default reply agent"
        }
    
    
def expose_chat_prompt_template_for_default_reply_agent():
    return chat_prompt_template_for_default_reply_agent