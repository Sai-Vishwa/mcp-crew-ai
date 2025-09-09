
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from langchain.agents import initialize_agent , AgentType
from langchain.prompts import MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage
from cachetools import TTLCache
from ..tools.set_tools import Tools




store = None
dev_prompt_reasoning_agent = None
dev_prompt_execution_agent = None
llm = None
reasoning_agent = None
reasoning_agent_with_memory = None
execution_agent = None 



class MemoryClass (BaseChatMessageHistory , BaseModel):
    
    messages: list[BaseMessage] = Field(default_factory=list)
    
    def add_messages(self, messages: list[BaseMessage]) -> None:
        self.messages.extend(messages)

    def clear(self) -> None:
        self.messages = []
    


def get_by_session_id(session_id: str) -> BaseChatMessageHistory:
    
    global store
    
    if session_id not in store:
        print("AABATHU")
        print(session_id)
        store[session_id] = [MemoryClass(),"yaara nee","ithu epdi trigger aachu"]
    return store[session_id[0]]






def set_agents():
    
    try:
    
        global store
        global dev_prompt_execution_agent
        global dev_prompt_reasoning_agent
        global llm
        global reasoning_agent
        global reasoning_agent_with_memory
        global execution_agent
        
        
        store = {}
        store = TTLCache(maxsize=10000, ttl=600)
        
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