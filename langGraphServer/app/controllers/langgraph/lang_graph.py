# from typing import Annotated

# from typing_extensions import TypedDict

# from langgraph.graph import StateGraph, START, END
# from langgraph.graph.message import add_messages

from langchain_xai import ChatXAI
import asyncio
from langchain_mcp_adapters.client import MultiServerMCPClient
import os
from dotenv import load_dotenv
from langchain.agents import initialize_agent , AgentType
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model
import json
from langchain.tools import StructuredTool
from langchain_core.messages import HumanMessage, SystemMessage
from langchain.memory import ConversationSummaryBufferMemory 
from langchain.agents import AgentExecutor 
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage, AIMessage
from langchain.prompts import SystemMessagePromptTemplate
from typing import List
import httpx
from flask import jsonify

load_dotenv()

async def get_mcp_tools():
    tools = await client.get_tools()
    # print(tools)
    return tools


from langchain_google_genai import ChatGoogleGenerativeAI


prompt = ChatPromptTemplate.from_messages([
    MessagesPlaceholder(variable_name="history"),  # memory slot
    ("human", "{input}")  # user input
])

from langchain.tools import StructuredTool
from pydantic import BaseModel

class ExamInput(BaseModel):
    placements : List[str]
    exams : List[str]
    date : str

def date_clash_checker(placements : list , exams : list , date : str) -> str:
    return f"Clash um ila oru mannum ila"

date_clash_checker_tool = StructuredTool.from_function(
    func=date_clash_checker,
    name="DateClashChecker",
    description="With a lsit of all placement entries or with a list of all exam entries provided the tool checks for clash in a specific date",
    args_schema=ExamInput
)



class MemoryClass (BaseChatMessageHistory , BaseModel):
    
    messages: list[BaseMessage] = Field(default_factory=list)
    
    def add_messages(self, messages: list[BaseMessage]) -> None:
        self.messages.extend(messages)

    def clear(self) -> None:
        self.messages = []
    

def get_by_session_id(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = MemoryClass()
    return store[session_id]

async def set_up_agents():
    tools = await get_mcp_tools()
    tools.append(date_clash_checker_tool)
    
    dev_prompt = ""
 
    with open("reasoning_agent_developer_prompt.txt" , "r" , encoding="utf-8") as file :
        dev_prompt = file.read()
    
    toolsStr = "\n".join([f"{tool.name}: {tool.description}" for tool in tools])
    print(toolsStr)
    dev_prompt = SystemMessagePromptTemplate.from_template(
        template=dev_prompt , 
        partial_variables={} , 
    )
    # print(dev_prompt)
    
   
   
    reasoning_agent_with_memory = RunnableWithMessageHistory(
        reasoning_agent , 
        get_by_session_id , 
        input_messages_key= "input",
        history_messages_key= "chat_history",
        output_messages_key= "output"
    )
    
    ans = reasoning_agent_with_memory.invoke(
        {"input" :"update practical exam from 4th sept to 8th sept"+toolsStr},
        config= {"configurable" : {"session_id": "Leo"}}    
    )


async def main():
    await set_up_agents()
    
asyncio.run(main())















Tools = []

client = MultiServerMCPClient(
    {
        "transport": {
            "url": "http://localhost:4007/mcp",
            "transport": "streamable_http",
        },
        "exam_cell": {
            "url": "http://localhost:4008/mcp",
            "transport": "streamable_http",
        },
        "placment": {
            "url": "http://localhost:4009/mcp", 
            "transport": "streamable_http",
        }
    }
)



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


store = {}

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



async def langGraphInvoke(body):
    try:
        user_session = body.get("session")
        chat_session = body.get('chat_session')
        prompt = body.get("propmt")
        actual_chat_session = chat_session
        global Tools
        global execution_agent
        global store
        if not user_session or chat_session or prompt:
            yield json.dumps({
                "thinking" : "no",
                "message" : "wrong request",
                "isFinalChunk" : "yes"
            })
            return
        
        if(len(Tools)==0):
            yield json.dumps({
                "thinking": "yes",
                "message": "fetching tools",
                "isFinalChunk": "no"
            })
            
            TOOLS = await get_mcp_tools()
            print("im loading tools ra elei")
            
            yield json.dumps({
                "thinking": "yes",
                "message": "setting agents",
                "isFinalChunk": "no"
            })
            
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
            
        if(chat_session == "new"):
            yield json.dumps({
                "thinking": "yes",
                "message": "Setting up a new chat",
                "isFinalChunk": "no"
            })
            async with httpx.AsyncClient() as client:
                response = await client.post("http://localhost:4004/create-new-chat-session", json={"user_session": user_session })
                resp = response.json()
                if resp["status"] == "error":
                    yield json.dumps({
                        "thinking": "no",
                        "message": "Cannot create a new chat to answer your question.. try again",
                        "isFinalChunk": "yes"
                    })
                    return 
                actual_chat_session = resp["chat_session"]
                store[actual_chat_session] = [MemoryClass(),user_session,resp["user_id"]]
                
              
        else :
            chat_in_store = store.get(chat_session)
            if(chat_in_store is not None):
                memory_in_store = chat_in_store[0]
                
                
            async with httpx.AsyncClient() as client:
                response = await client.post("http://localhost:4004/valid-chat-session", json={"user_session": user_session , "chat_session":chat_session})
                resp = response.json()
                print("hey this is the resp i got --- ")
                print(resp)
                if resp["status"] == "error":
                    return jsonify({"status": "error", "message": resp["message"]})
                return jsonify({"status": "success", "message": "Bot page details fetched successfully", "data": resp["data"]})
                    
            
    except Exception as e:
        yield f"Error : {str(e)}"
        
