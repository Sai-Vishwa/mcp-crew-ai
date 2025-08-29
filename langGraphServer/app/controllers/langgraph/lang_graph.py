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
    return tools


from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",   # or "gemini-1.5-flash" (cheaper & faster)
    google_api_key=os.getenv("GEMINI_API"),
    temperature=0.7,
    max_output_tokens=1000,
)


async def set_up_agents():
    tools = await get_mcp_tools()
 

    memory = ConversationSummaryBufferMemory(
        llm=llm,
        max_token_limit=300,
        return_messages=True,
        memory_key="chat_history"
    )

    reasoning_agent = initialize_agent(
        llm= llm,
        agent= AgentType.OPENAI_MULTI_FUNCTIONS,
        verbose= True,
        memory = memory,
        tools=[],
        agent_kwargs={
            "extra_prompt_messages" : [MessagesPlaceholder(variable_name="chat_history")]
        }
    )
   
    ans = reasoning_agent.invoke({
        "input" :"Hi my name is Leo Dass"
    })
    
    ans2 = reasoning_agent.invoke({
        "input" : "What is my name"
    })
    
    val = reasoning_agent.memory.copy()
    print("val")
    print(val)    
    print(memory.buffer)



async def main():
    await set_up_agents()
    
asyncio.run(main())
