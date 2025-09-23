import json
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from langchain.agents import initialize_agent , AgentType
from langchain.prompts import MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import BaseMessage
from redis.asyncio import Redis
from ..tools.set_tools import expose_tools
from ...state import FlagState
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_core.messages import BaseMessage, message_to_dict
import logging
from dotenv import load_dotenv
import asyncio
from langchain_core.chat_history import BaseChatMessageHistory
from typing import Callable, Any



from langchain_redis.chat_message_history import RedisChatMessageHistory


import json
import logging
from typing import List, Optional, Any

from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import (
    BaseMessage,
    message_to_dict,
    messages_from_dict,
)

from .trial import get_client

logger = logging.getLogger(__name__)



logger = logging.getLogger(__name__)

dev_prompt_reasoning_agent = None
dev_prompt_execution_agent = None
llm = None
reasoning_agent = None
reasoning_agent_with_memory = None
execution_agent = None 

load_dotenv()
    
    
    
class CustomClassTry(BaseChatMessageHistory) : 
    

    def __init__(
         self,
        session_id: str,
        user_session: str,
        chat_session: str,
        redis_client: Redis,
        key_prefix: str = "message_store:",
        ttl: int = 900,
        max_messages: int = 10, 
    ):
    
        self.session_id = session_id
        self.key_prefix = key_prefix
        self.ttl = ttl
        self.redis_client = redis_client
        self.user_session = user_session
        self.chat_session = chat_session
        self.max_messages = max_messages
        
    @classmethod
    async def create_memory(cls, 
                            session_id: str,
                            user_session: str,
                            chat_session: str,
                            url: str = "redis://localhost:6379/0",
                            key_prefix: str = "message_store:",
                            ttl: int = 900,
                            max_messages: int = 10, 
    ) : 
        try:
            import redis.asyncio as redis
        except ImportError:
            raise ImportError(
                "Could not import redis python package. "
                "Please install it with `pip install redis`."
            )

        try:
            redis_client = await get_client(redis_url=url)
            instance = cls(
                session_id=session_id,
                user_session=user_session,
                chat_session=chat_session,
                redis_client=redis_client,
                key_prefix=key_prefix,
                ttl=ttl,
                max_messages=max_messages
            )   
            return instance
                
        except redis.ConnectionError as error:
            logger.error(error)

    @property
    def key(self) -> str:
        """Construct the record key to use"""
        return self.key_prefix + self.session_id

    @property
    async def messages(self) -> List[BaseMessage]:
        """Retrieve the messages from Redis"""
        _items = await self.redis_client.lrange(self.key, 0, -1)
        items = [json.loads(m.decode("utf-8")) for m in _items[::-1]]
        messages = messages_from_dict(items)
        return messages

    @messages.setter
    def messages(self, messages: List[BaseMessage]) -> None:
        raise NotImplementedError(
            "Direct assignment to 'messages' is not allowed."
            " Use the 'aadd_message' instead."
        )

    async def aadd_message(self, message: BaseMessage) -> None:
            try:
                await self.redis_client.lpush(self.key, json.dumps(message_to_dict(message)))

                await self.redis_client.ltrim(self.key, 0, self.max_messages - 1)

                if self.ttl:
                    await self.redis_client.expire(self.key, self.ttl)

            except Exception as e:
                logger.error(f"Failed to add message to Redis: {e}")

    async def aclear(self) -> None:
        """Clear session memory from Redis"""
        await self.redis_client.delete(self.key)
        
    async def clear(self) -> None:
        """Clear session memory from Redis"""
        await self.redis_client.delete(self.key)

    async def aget_messages(self):
        _items = await self.redis_client.lrange(self.key, 0, -1)
        items = [json.loads(m.decode("utf-8")) for m in _items[::-1]]
        messages = messages_from_dict(items)
        return messages
    
class CustomRedisClass(CustomClassTry) :
    
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
                
                
                
        
        
class AsyncRunnableWithMessageHistory :
    
    def __init__(
        self,
        runnable: Any,
        get_session_history: Callable[[str], Any],
        **kwargs
    ):
        self.sync_chain = RunnableWithMessageHistory(
            runnable=runnable,
            get_session_history=self._sync_session_wrapper(get_session_history),
            **kwargs
        )
        self.get_session_history_async = get_session_history
    
    def _sync_session_wrapper(self, async_getter):
        """Wrap async getter to work with sync RunnableWithMessageHistory"""
        def sync_getter(session_id: str) -> BaseChatMessageHistory:
            try:
                loop = asyncio.get_running_loop()
                # This might block, but it's what LangChain expects
                future = asyncio.run_coroutine_threadsafe(
                    async_getter(session_id), loop
                )
                return future.result()
            except RuntimeError:
                return asyncio.run(async_getter(session_id))
        return sync_getter
    
    async def ainvoke(self, input: dict, config: dict = None):
        """Async invoke that uses your async session history"""
        # Your custom async implementation here
        # You'd need to handle the session history async properly
        pass




async def is_redis_memory_not_created(chat_session : str , user_session : str) -> bool:
    
    mmy = await CustomClassTry.create_memory(
        chat_session=chat_session,
        session_id = chat_session,
        user_session=user_session
    )
    value = await mmy.redis_client.get(chat_session+"MeowDass")
    
    if(value is None):
        return True
    return False
    

def aget_by_session_id(session_id: str) -> CustomClassTry:
    
        print("get by session id is getting called")
    
        redis_mmy =  CustomClassTry.create_memory(
        chat_session= session_id,
        session_id = session_id,
        user_session= "anything",
        url= "redis://localhost:6379/0",
        ttl=900
    )
        
        
    
        value =  redis_mmy.redis_client.get(session_id+"MeowDass")
        
        redis_mmy.user_session = value
        
        print("Na iruken vro")

        if(value is None):
            print("AABATHU")
            print(session_id)
            ##do some logs here 
            
            
        return redis_mmy
    
    
    




async def set_agents(state : FlagState) -> FlagState:
    
    try:
    
        global dev_prompt_execution_agent
        global dev_prompt_reasoning_agent
        global llm
        global reasoning_agent
        global reasoning_agent_with_memory
        global execution_agent
        
        Tools = expose_tools()
        
        dev_prompt_reasoning_agent = ""
        dev_prompt_execution_agent = ""
        
        with open("lang_graph/nodes/agents/reasoning_agent_developer_prompt.txt" , "r" , encoding="utf-8") as file :
            dev_prompt_reasoning_agent = file.read()

        with open("lang_graph/nodes/agents/execution_agent_developer_prompt.txt" , "r" , encoding="utf-8") as file :
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
            tools=Tools,
            agent_kwargs={
            "extra_prompt_messages": [
                    dev_prompt_reasoning_agent ,
                    MessagesPlaceholder(variable_name="chat_history")
                ]
            },
        )
        reasoning_agent_with_memory = RunnableWithMessageHistory(
            reasoning_agent , 
            aget_by_session_id, 
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
        print(e)
        
        return {
            "status" : "error",
            "message" : "There is error in setting up agents"
        }
        
def expose_all():
    return {
        "reasoning_agent" : reasoning_agent,
        "reasoning_agent_with_memory" : reasoning_agent_with_memory,
        "dev_prompt_reasoning_agent" : dev_prompt_reasoning_agent,
        "dev_prompt_execution_agent" : dev_prompt_execution_agent,
        "llm" : llm,
        "execution_agent" : execution_agent
    }
    
def expose_reasoning_agent_with_memory():
    return reasoning_agent_with_memory

def expose_execution_agent():
    return execution_agent