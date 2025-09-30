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
from typing import AsyncIterator, List , Dict
import httpx
from flask import jsonify
from cachetools import TTLCache
from typing import TypedDict , NotRequired , Any , Optional
from langgraph.graph import StateGraph , END , START

from langgraph.store.redis.aio import AsyncRedisStore

from pprint import pprint


# lang_graph.py (top of the file)
import sys
from pathlib import Path

# Add the parent folder to sys.path
sys.path.append(str(Path(__file__).parent.parent.resolve()))


from langgraph.checkpoint.redis.aio import AsyncRedisSaver



from lang_graph.nodes.tools.are_tools_set import are_tools_set , are_tools_set_wrapper
from lang_graph.nodes.tools.set_tools import set_tools
from lang_graph.nodes.agents.are_agents_set import are_agents_set , are_agents_set_wrapper
from lang_graph.nodes.agents.set_agents import set_agents
from lang_graph.nodes.loading_memory.is_memory_loaded import is_memory_loaded , is_memory_loaded_wrapper
from lang_graph.nodes.loading_memory.load_memory import load_memory
from lang_graph.nodes.requestValidation.is_new_chat import is_new_chat , is_new_chat_wrapper
from lang_graph.nodes.requestValidation.is_valid_user_session_for_new_chat import is_valid_user_session_for_new_chat
from lang_graph.nodes.requestValidation.is_valid_user_session_for_old_chat import is_valid_user_session_for_old_chat
from lang_graph.nodes.loading_relevant_workflows.load_relevant_workflows import load_relevant_workflows
from lang_graph.nodes.reasoning_agent.invoke_reasoning_agent import invoke_reasoning_agent
# from lang_graph.nodes.reasoning_agent.is_invoke_success import is_invoke_success , is_invoke_success_wrapper
from lang_graph.nodes.reasoning_agent.reasoning_agent_output_formatter import reasoning_agent_output_formatter
# from lang_graph.nodes.requestValidation.is_new_workflow import is_new_workflow , is_new_workflow_wrapper
from lang_graph.state import InputState , ReasoningAgentInputState , ReasoningAgentResponseState
from lang_graph.nodes.loading_relevant_workflows.load_relevant_workflows import load_relevant_workflows

from lang_graph.nodes.error_checker.error_checker import error_checker , error_checker_wrapper , error_checker_last_wrapper

from lang_graph.nodes.prompt.is_prompt_template_set import is_prompt_template_set , is_prompt_template_set_wrapper
from lang_graph.nodes.prompt.set_prompt_for_user_request import set_prompt_for_user_request
from lang_graph.nodes.prompt.set_prompt_template import set_prompt_template



load_dotenv()




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


compiled_graph = None

is_redis_setup_done = False

    
# async def main():
    
    
#     dummy_state = InputState(
#     user_input="Reschedule final exams from 20th Sept to 25th Sept remember to check for clash with placements",
#     user_session="sess1234",
#     is_new_chat=True,
#     user_input_id=-1
# )
#     async for event in compiled_graph.astream(dummy_state, config={"configurable": {"thread_id": "test_thread"}}):
#         print(event.keys())
#         print()
#         print(list(event.values())[0]["message"])
#         print()
#         print()

class DebugAsyncRedisSaver(AsyncRedisSaver):
    async def aput(self, config, checkpoint, metadata, new_versions):
        # print("-----------------------------------------------------\n\n\n")
        # # print(metadata)
        # # print(checkpoint)\
        # print("see config \n")
        # print(config)
        # print("\n versions new")
        # print(new_versions)
        # print("inga paaru \n\n\n\n")
        # print(f"Saving checkpoint: {checkpoint}")
        return await super().aput(config, checkpoint, metadata, new_versions)


async def compile_graph():
    
    
    try: 
        
        DB_URI = "redis://localhost:6380/0"
        
        async with (DebugAsyncRedisSaver.from_conn_string(DB_URI) as checkpointer) :
            
            global compiled_graph
        
            global is_redis_setup_done
            
            graph = StateGraph(InputState , output_schema=ReasoningAgentResponseState)
            
            nodes = {
                "are_tools_set": are_tools_set_wrapper,
                "set_tools": set_tools,
                "are_agents_set": are_agents_set_wrapper,
                "set_agents": set_agents,
                "is_new_chat": is_new_chat_wrapper,
                "is_valid_user_session_for_old_chat": is_valid_user_session_for_old_chat,
                "is_valid_user_session_for_new_chat": is_valid_user_session_for_new_chat,
                "is_memory_loaded": is_memory_loaded_wrapper,
                "load_memory": load_memory,
                "load_relevant_workflows": load_relevant_workflows,
                "invoke_reasoning_agent": invoke_reasoning_agent,
                "reasoning_agent_output_formatter": reasoning_agent_output_formatter,
                "is_prompt_template_set": is_prompt_template_set_wrapper,
                "set_prompt_template" : set_prompt_template,
                "set_prompt_for_user_request" : set_prompt_for_user_request,
                "error_checker1": error_checker_wrapper,
                "error_checker2": error_checker_wrapper,
                "error_checker3": error_checker_wrapper,
                "error_checker4": error_checker_wrapper,
                "error_checker5": error_checker_wrapper,
                "error_checker6": error_checker_wrapper,
                "error_checker7": error_checker_wrapper,
                "error_checker8": error_checker_wrapper,
                "error_checker9": error_checker_wrapper,
                "error_checker10": error_checker_last_wrapper
            }


            for key,value in nodes.items():
                graph.add_node(key , value)

            # Add edges
            graph.add_edge(
                START, "are_tools_set"
            )

            graph.add_conditional_edges(
                "are_tools_set",
                are_tools_set,
                {
                    "error": END,
                    "no": "set_tools",
                    "yes": "are_agents_set"
                }
            )

            graph.add_edge(
                "set_tools" , "error_checker1"
            )

            graph.add_conditional_edges(
                "error_checker1",
                error_checker, {
                    "success" : "are_agents_set",
                    "error" : END
                } 
            )

            graph.add_conditional_edges(
                "are_agents_set",
                are_agents_set,
                {
                    "error": END,
                    "no": "set_agents", 
                    "yes": "is_new_chat"
                }
            )


            graph.add_edge(
                "set_agents" , "error_checker2"
            )

            graph.add_conditional_edges(
                "error_checker2",
                error_checker, {
                    "success" : "is_new_chat",
                    "error" : END
                } 
            )

            graph.add_conditional_edges(
                "is_new_chat",
                is_new_chat,
                {
                    "error": END, 
                    "yes": "is_valid_user_session_for_new_chat",
                    "no": "is_valid_user_session_for_old_chat"
                }
            )

            graph.add_edge(
                "is_valid_user_session_for_new_chat" , "error_checker3"
            )

            graph.add_conditional_edges(
                "error_checker3",
                error_checker, {
                    "success" : "is_memory_loaded",
                    "error" : END
                } 
            )

            graph.add_edge(
                "is_valid_user_session_for_old_chat" , "error_checker4"
            )

            graph.add_conditional_edges(
                "error_checker4",
                error_checker, {
                    "success" : "is_memory_loaded",
                    "error" : END
                } 
            )

            graph.add_conditional_edges(
                "is_memory_loaded",
                is_memory_loaded,
                {
                    "error": END, 
                    "yes": "load_relevant_workflows", 
                    "no": "load_memory"
                }
            )

            graph.add_edge(
                "load_memory" , "error_checker5"
            )

            graph.add_conditional_edges(
                "error_checker5",
                error_checker, {
                    "success" : "load_relevant_workflows",
                    "error" : END
                } 
            )


            graph.add_edge(
                "load_relevant_workflows", "error_checker6"
            )

            graph.add_conditional_edges(
                "error_checker6",
                error_checker,
                {
                    "error": END, 
                    "success": "is_prompt_template_set", 
                }
            )

            graph.add_conditional_edges(
                "is_prompt_template_set",
                is_prompt_template_set,
                {
                    "error" : END,
                    "yes" : "set_prompt_for_user_request",
                    "no" : "set_prompt_template"
                }
            )

            graph.add_edge(
                "set_prompt_template" , "error_checker7"
            )

            graph.add_conditional_edges(
                "error_checker7",
                error_checker,
                {
                    "success" : "set_prompt_for_user_request",
                    "error" : END
                }
            )

            graph.add_edge(
                "set_prompt_for_user_request" , "error_checker8"
            )

            graph.add_conditional_edges(
                "error_checker8",
                error_checker,
                {
                    "success" : "invoke_reasoning_agent",
                    "error" : END
                }
            )

            graph.add_edge(
                "invoke_reasoning_agent" , "error_checker9"
            )

            graph.add_conditional_edges(
                "error_checker9", 
                error_checker,
                {
                    "error" : END,
                    "success" : "reasoning_agent_output_formatter"
                }
            )

            graph.add_edge(
                "reasoning_agent_output_formatter" , "error_checker10"
            )

            graph.add_conditional_edges(
                "error_checker10" , 
                error_checker,
                {
                    "success" : END,
                    "error" : "invoke_reasoning_agent"
                }
            )
            
            
            print("\n\n setting up checkpointer\n\n") 
            
            if(is_redis_setup_done==False):
            
                await checkpointer.asetup()
                
                is_redis_setup_done = True
            
            compiled_graph = graph.compile(checkpointer=checkpointer)
            
            
            print("=======================================")
            print("\n\n")

            with open("graph.png", "wb") as f:
                f.write(compiled_graph.get_graph().draw_png())
                
            return compiled_graph
    
    except Exception as e :
        
        print("ennala mudila da ebba")
        
        print(e)


        
        

        
    
        
async def invoke_graph(data) : 
    
    try: 
        
        global compiled_graph
        
        
        if(compiled_graph == None) :
            
            print("\n\n======================\n\n")
            print("calling compile graph")
            
            compiled_graph = await compile_graph()
    
        user_input = data.get("user_input")
        user_session = data.get("user_session")
        chat_session = data.get("chat_session")
        is_new_chat = data.get("is_new_chat")
        
        if(is_new_chat):
            chat_session = None
        
        state = InputState (
            user_input=user_input , 
            user_session=user_session,
            is_new_chat=is_new_chat,
            chat_session=chat_session,
            user_input_id=-1
        )
        
        print(" i am here ")
        
        flag = False
        
        
        async for event in compiled_graph.astream(state, config={"configurable": {"thread_id": "test_thread"}}, stream_mode="updates"):
            
            
            try :
                
                
                Lists = list(event.values())[0]
                
                value : ReasoningAgentResponseState  = Lists["formatted_response"]
                
                
                print("===============================================================")
                print("tho paaru ======")
                print(value)
                
                value = value.model_dump_json(exclude_none = True)

                
                resp = {
                    "is_final" : "true" , 
                    "resp" : value
                }
                
                flag = True
                print("itho yie;d uh")
                yield f"data: {json.dumps(resp)}\n\n"
                print("itho after yield uh")
                
                
            except Exception as e : 
                
                
                print("enna vro error")
                print(e)

                Lists = list(event.values())[0]
                
                value = Lists["message"]
                
                print("tho paaru ======")
                print(value)
                
                resp = {
                    "is_final" : "false",
                    "resp" : value
                }
                if(flag == False) : 
                    yield f"data: {json.dumps(resp)}\n\n"
        
    except Exception as e : 
        
        value = {
            "is_final": "true" , 
            "value" : "some internal error happened"
        }
        yield f"data: {json.dumps(value)}\n\n"
    
        
# asyncio.run(main())