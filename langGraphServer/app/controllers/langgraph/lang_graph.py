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
    # print(type(tools))
    # print(tools)
    return tools

# llm = ChatXAI(
#     model="llama3-8b-8192",
#     xai_api_key=os.getenv("GROK_API"),
#     temperature=0.7,
#     max_tokens=1000,
# )

from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",   # or "gemini-1.5-flash" (cheaper & faster)
    google_api_key=os.getenv("GEMINI_API"),
    temperature=0.7,
    max_output_tokens=1000,
)


async def set_up_agents():
    tools = await get_mcp_tools()
    # with open("reasoning_agent_developer_prompt.txt", "r") as f:
    #     developer_prompt = f.read()
    final_prompt = ChatPromptTemplate.from_messages([
    ("system", """
You are a reasoning agent that outputs ONLY valid JSON workflows. 

STRICT RULES (must always be followed):
1. Your output MUST be valid JSON — nothing else.
2. JSON must strictly match this schema:

{
  "workflow": [
    {
      "step": <integer starting from 1>,
      "tool": "<tool_name>",
      "args": { <key-value pairs of arguments for the tool> }
    }
  ]
}

3. If no valid workflow is possible, return exactly:
{
  "workflow": []
}

4. DO NOT include explanations, natural language, comments, markdown, or extra keys. 
   Output JSON ONLY.

5. Tool usage rules:
   - Use ONLY the tools provided in the list below.
   - Use tool names EXACTLY as provided.
   - Do NOT invent tools.
   - If arguments are missing, still output a workflow but leave missing args as empty strings.

6. Steps must always be ordered starting from 1, incremented by 1.

"""),
    ("system", "Available tools:\n{tool_descriptions}"),
    ("system", "Previous workflow (may be empty):\n{previous_workflow}"),
    ("human", "{input}")
])

    reasoning_agent = initialize_agent(
        tools= tools,
        llm= llm,
        agent= AgentType.OPENAI_MULTI_FUNCTIONS,
        verbose= True
    )
    tools_json = []
    for t in tools:
        tools_json.append({
            "name": t.name,
            "description": t.description,
            "args_schema": (
                t.args_schema.schema()
                if hasattr(t.args_schema, "schema")
                else t.args_schema  # sometimes already dict
            )
        })

    ans = await reasoning_agent.ainvoke({
        "input" :"""
You are a reasoning agent that outputs ONLY valid JSON workflows. 

STRICT RULES (must always be followed):
1. Your output MUST be valid JSON — nothing else.
2. JSON must strictly match this schema:

{
  "workflow": [
    {
      "step": <integer starting from 1>,
      "tool": "<tool_name>",
      "args": { <key-value pairs of arguments for the tool> }
    }
  ]
}

3. If no valid workflow is possible, return exactly:
{
  "workflow": []
}

4. DO NOT include explanations, natural language, comments, markdown, or extra keys. 
   Output JSON ONLY.

5. Tool usage rules:
   - Use ONLY the tools provided in the list below.
   - Use tool names EXACTLY as provided.
   - Do NOT invent tools.
   - If arguments are missing, still output a workflow but leave missing args as empty strings.

6. Steps must always be ordered starting from 1, incremented by 1.

""" + "\n\nSchedule interview on 28th for Zoho"
    })
    
    print(ans["output"])



async def main():
    await set_up_agents()
    
asyncio.run(main())
