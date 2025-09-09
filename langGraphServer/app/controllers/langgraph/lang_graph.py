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
from cachetools import TTLCache
from typing import TypedDict , NotRequired , Any , Optional
from langgraph.graph import StateGraph , END , START

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
    
   
   
   
    
    ans = reasoning_agent_with_memory.invoke(
        {"input" :"update practical exam from 4th sept to 8th sept"+toolsStr},
        config= {"configurable" : {"session_id": "Leo"}}    
    )


async def main():
    await set_up_agents()
    
asyncio.run(main())





























toolsStr = ""

reference_store = []

class toolCallInfo(BaseModel):
    tool_name : str
    input : dict
    status : str
    message : Optional[str]
    data : Optional[Any]
    

class Workflow(BaseModel):
    step_number : int
    tool_name : str
    tool_description : str



class State(BaseModel):
    user_input_id : int
    user_input : str
    user_session : str
    chat_session : str
    user_name : str
    is_new_chat : bool
    workflow_name : str
    workflow_description : str
    steps : List[Workflow]
    current_step : Workflow
    completed_tools : List[Workflow]
    current_tool_call_info : toolCallInfo
    completed_tool_calls_info : List[toolCallInfo]
    final_response : str
    is_memory_loaded : bool
    is_relevant_inputs_loaded : bool
    
    
graph = StateGraph(State)
graph.add_node()
    
    

async def langGraphInvoke(body):
    try:
        
        
        
        user_session = body.get("session")
        chat_session = body.get('chat_session')
        prompt = body.get("propmt")
        actual_chat_session = chat_session
        global Tools
        global execution_agent
        global store
        global reasoning_agent_with_memory
        global toolsStr
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
            
            Tools = await get_mcp_tools()
            toolsStr = "\n".join([f"{tool.name}: {tool.description}" for tool in Tools])
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
            
        if(len(reference_store)==0):
            
            yield json.dumps({
                "thinking": "yes",
                "message": "Fetching previous workflows generated by the llm for it's reference",
                "isFinalChunk": "no"
            })
            async with httpx.AsyncClient() as client:
                response = await client.post("http://localhost:4004/fetch-reasoning-agent-workflows", json={"master_password":os.getenv("MASTER_PASSWORD")})
                resp = response.json()
                if resp["status"] == "error":
                    yield json.dumps({
                        "thinking": "no",
                        "message": "Cannot retrieve old workflows",
                        "isFinalChunk": "yes"
                    })
                actual_chat_session = resp["chat_session"]
                store[actual_chat_session] = [MemoryClass(),user_session,resp["user_id"]]
            yield json.dumps({
                "thinking": "yes",
                "message": "Sending your request to the reasoning agent",
                "isFinalChunk": "no"
            })
            response_from_reasoning_agent = await reasoning_agent_with_memory.ainvoke(
                {"input" :prompt+toolsStr},
                config= {"configurable" : {"session_id": actual_chat_session}}    
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
                store[actual_chat_session] = [  (),user_session,resp["user_id"]]
            yield json.dumps({
                "thinking": "yes",
                "message": "Sending your request to the reasoning agent",
                "isFinalChunk": "no"
            })
            response_from_reasoning_agent = await reasoning_agent_with_memory.ainvoke(
                {"input" :prompt+toolsStr},
                config= {"configurable" : {"session_id": actual_chat_session}}    
            )
                
              
        else :
            chat_in_store = store.get(chat_session)
            if(chat_in_store is not None):
                if(user_session != chat_in_store[1]):
                    print()
                    #await for diff session else discard
                #invoke
            else:                
                async with httpx.AsyncClient() as client:
                    response = await client.post("http://localhost:4004/valid-chat-session-and-return-messages", json={"user_session": user_session , "chat_session":chat_session})
                    resp = response.json()
                    print("hey this is the resp i got --- ")
                    print(resp)
                    if resp["status"] == "error":
                        return jsonify({"status": "error", "message": resp["message"]})
                    return jsonify({"status": "success", "message": "Bot page details fetched successfully", "data": resp["data"]})
                    
            
    except Exception as e:
        yield f"Error : {str(e)}"
        
