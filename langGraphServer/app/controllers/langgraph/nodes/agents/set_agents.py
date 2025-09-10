
import json
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from langchain.agents import initialize_agent , AgentType
from langchain.prompts import MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import BaseMessage
from ..tools.set_tools import Tools
from ...lang_graph import State
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_core.messages import BaseMessage, message_to_dict
import logging

logger = logging.getLogger(__name__)

dev_prompt_reasoning_agent = None
dev_prompt_execution_agent = None
llm = None
reasoning_agent = None
reasoning_agent_with_memory = None
execution_agent = None 

    
    
class CustomRedisClass(RedisChatMessageHistory) :
    
        def __init__(
        self,
        session_id: str,
        user_session: str,
        chat_session: str,
        url: str = "redis://localhost:6379/0",
        key_prefix: str = "message_store:",
        ttl: int = 900,
        max_messages: int = 10, 
        ):

            super().__init__(session_id=session_id, url=url, key_prefix=key_prefix, ttl=ttl)
            
            self.user_session = user_session
            self.chat_session = chat_session
            self.max_messages = max_messages
            
        def add_message(self, message: BaseMessage) -> None:
            try:
                self.redis_client.lpush(self.key, json.dumps(message_to_dict(message)))

                self.redis_client.ltrim(self.key, 0, self.max_messages - 1)

                if self.ttl:
                    self.redis_client.expire(self.key, self.ttl)

            except Exception as e:
                logger.error(f"Failed to add message to Redis: {e}")
        



async def is_redis_memory_not_created(chat_session : str):
    
    mmy = CustomRedisClass(
        chat_session=chat_session,
        session_id = chat_session
    )
    value = await mmy.redis_client.get(chat_session+"MeowDass")
    
    
    if(value is None):
        return True
    return False
    

async def get_by_session_id(session_id: str) -> RedisChatMessageHistory:
    
    
    redis_mmy = CustomRedisClass(
        chat_session= session_id,
        session_id = session_id,
        url= "redis://localhost:6379/0",
        ttl=900
    )
    
    value = await redis_mmy.redis_client.get(session_id+"MeowDass")

    
    if(value is None):
        print("AABATHU")
        print(session_id)
        ##do some logs here 
        
        
    return redis_mmy




async def set_agents(state : State):
    
    try:
    
        global dev_prompt_execution_agent
        global dev_prompt_reasoning_agent
        global llm
        global reasoning_agent
        global reasoning_agent_with_memory
        global execution_agent
        
        
        dev_prompt_reasoning_agent = ""
        dev_prompt_execution_agent = ""
        
        with open("reasoning_agent_developer_prompt.txt" , "r" , encoding="utf-8") as file :
            dev_prompt_reasoning_agent = file.read()

        with open("execution_agent_developer_prompt.txt" , "r" , encoding="utf-8") as file :
            dev_prompt_execution_agent = file.read()

        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",  
            google_api_key=os.getenv("GEMINI_API"),
            temperature=0.2,
            max_output_tokens=1000,
        )
        
        reasoning_agent = initialize_agent(
            llm= llm,
            agent= AgentType.OPENAI_MULTI_FUNCTIONS,
            verbose= True,
            tools=[],
            agent_kwargs={
            "extra_prompt_messages": [
                    dev_prompt_reasoning_agent ,
                    MessagesPlaceholder(variable_name="chat_history")
                ]
            },
        )
        reasoning_agent_with_memory = RunnableWithMessageHistory(
            reasoning_agent , 
            get_by_session_id , 
            input_messages_key= "input",
            history_messages_key= "chat_history",
            output_messages_key= "output"
        )
        
        execution_agent = initialize_agent(
            llm= llm,
            agent= AgentType.OPENAI_MULTI_FUNCTIONS,
            verbose= True,
            tools=Tools,
            agent_kwargs={
            "extra_prompt_messages": [
                    dev_prompt_execution_agent ,
                    MessagesPlaceholder(variable_name="chat_history")
                ]
            },
        )
        return {
            "status" : "success",
            "message" : "Agents are set up successfully"
        }
        
    except Exception as e:
        return {
            "status" : "error",
            "message" : "There is error in setting up agents"
        }