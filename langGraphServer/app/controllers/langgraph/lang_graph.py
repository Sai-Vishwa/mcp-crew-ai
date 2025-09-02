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

load_dotenv()

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

async def get_mcp_tools():
    tools = await client.get_tools()
    # print(tools)
    return tools


from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",  
    google_api_key=os.getenv("GEMINI_API"),
    temperature=0.7,
    max_output_tokens=1000,
)


store = {}

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
    reasoning_agent = initialize_agent(
        llm= llm,
        agent= AgentType.OPENAI_MULTI_FUNCTIONS,
        verbose= True,
        tools=[],
        agent_kwargs={
        "extra_prompt_messages": [
                dev_prompt ,
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
    
    ans = reasoning_agent_with_memory.invoke(
        {"input" :"update practical exam from 4th sept to 8th sept"+toolsStr},
        config= {"configurable" : {"session_id": "Leo"}}    
    )
    
    # ans2 = reasoning_agent_with_memory.invoke(
    #     {"input" :"Hi my name is Kanguva"},
    #     config= {"configurable" : {"session_id": "Kanguva"}}    
    # )
    
    # ans3 = reasoning_agent_with_memory.invoke(
    #     {"input" :"What is my name ??????"},
    #     config= {"configurable" : {"session_id": "Kanguva"}}    
    # )
    
    # ans4 = reasoning_agent_with_memory.invoke(
    #     {"input" :"What is my name vro "},
    #     config= {"configurable" : {"session_id": "Leo"}}    
    # )
    
    # print(store)


async def main():
    await set_up_agents()
    
asyncio.run(main())
