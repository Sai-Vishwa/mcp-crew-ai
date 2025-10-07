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
from lang_graph.state import InputState , ReasoningAgentInputState , ReasoningAgentResponseState , FlagState
from lang_graph.nodes.loading_relevant_workflows.load_relevant_workflows import load_relevant_workflows

from lang_graph.nodes.error_checker.error_checker import error_checker , error_checker_wrapper , error_checker_last_wrapper_for_default_reply_agent , error_checker_last_wrapper_for_reasoning_agent

from lang_graph.nodes.prompt_for_reasoning_agent.is_prompt_template_set_for_reasoning_agent import is_prompt_template_set_for_reasoning_agent , is_prompt_template_set_wrapper_for_reasoning_agent
from lang_graph.nodes.prompt_for_reasoning_agent.set_prompt_for_user_request_for_reasoning_agent import set_prompt_for_user_request_for_reasoning_agent
from lang_graph.nodes.prompt_for_reasoning_agent.set_prompt_template_for_reasoning_agent import set_prompt_template_for_reasoning_agent

from lang_graph.nodes.prompt_for_decider_agent.is_prompt_template_set_for_decider_agent import is_prompt_template_set_for_decider_agent , is_prompt_template_set_for_decider_agent_wrapper
from lang_graph.nodes.prompt_for_decider_agent.set_prompt_for_user_request_for_decider_agent import set_prompt_for_user_request_for_decider_agent
from lang_graph.nodes.prompt_for_decider_agent.set_prompt_template_for_decider_agent import set_prompt_template_for_decider_agent


from lang_graph.nodes.decider_agent.invoke_decider_agent import invoke_decider_agent
from lang_graph.nodes.decider_agent.decider_agent_output_formatter import decider_agent_output_formatter
from lang_graph.nodes.decider_agent.decision_to_call_correct_agent import decision_to_call_correct_agent ,decision_to_call_correct_agent_wrapper

from lang_graph.nodes.prompt_for_default_reply_agent.is_prompt_template_set_for_default_reply_agent import is_prompt_template_set_for_default_reply_agent , is_prompt_template_set_for_default_reply_agent_wrapper
from lang_graph.nodes.prompt_for_default_reply_agent.set_prompt_for_user_request_for_default_reply_agent import set_prompt_for_user_request_for_default_reply_agent
from lang_graph.nodes.prompt_for_default_reply_agent.set_prompt_template_for_default_reply_agent import set_prompt_template_for_default_reply_agent

from lang_graph.nodes.default_reply_agent.invoke_default_reply_agent import invoke_default_reply_agent
from lang_graph.nodes.default_reply_agent.default_reply_agent_output_formatter import default_reply_agent_output_formatter

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



async def dummy_node(state : FlagState) -> FlagState:
    
    return {
        "message" : "Hey vro thanks for using this app vro" , 
        "status" : "success"
    }

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
                "is_prompt_template_set_for_reasoning_agent": is_prompt_template_set_wrapper_for_reasoning_agent,
                "set_prompt_template_for_reasoning_agent" : set_prompt_template_for_reasoning_agent,
                "set_prompt_for_user_request_for_reasoning_agent" : set_prompt_for_user_request_for_reasoning_agent,
                "is_prompt_template_set_for_decider_agent": is_prompt_template_set_for_decider_agent_wrapper,
                "set_prompt_template_for_decider_agent" : set_prompt_template_for_decider_agent,
                "set_prompt_for_user_request_for_decider_agent" : set_prompt_for_user_request_for_decider_agent,                
                "error_checker1": error_checker_wrapper,
                "error_checker2": error_checker_wrapper,
                "error_checker3": error_checker_wrapper,
                "error_checker4": error_checker_wrapper,
                "error_checker5": error_checker_wrapper,
                "error_checker6": error_checker_wrapper,
                "error_checker7": error_checker_wrapper,
                "error_checker8": error_checker_wrapper,
                "error_checker9": error_checker_wrapper,
                "error_checker11": error_checker_wrapper,
                "error_checker12": error_checker_wrapper,
                "error_checker13": error_checker_wrapper,
                "error_checker14": error_checker_wrapper,
                "error_checker_last_for_reasoning_agent": error_checker_last_wrapper_for_reasoning_agent,
                "error_checker_last_for_default_reply_agent" : error_checker_last_wrapper_for_default_reply_agent,
                "error_checker15": error_checker_wrapper,
                "error_checker16": error_checker_wrapper,
                "error_checker17": error_checker_wrapper,
                "error_checker18": error_checker_wrapper,
                
                
                "invoke_decider_agent" : invoke_decider_agent,
                "decider_agent_output_formatter" : decider_agent_output_formatter,
                "decision_to_call_correct_agent" : decision_to_call_correct_agent_wrapper,
                "dummy_node" : dummy_node,
                
                "is_prompt_template_set_for_default_reply_agent" : is_prompt_template_set_for_default_reply_agent_wrapper,
                "set_prompt_template_for_default_reply_agent" : set_prompt_template_for_default_reply_agent,
                "set_prompt_for_user_request_for_default_reply_agent" : set_prompt_for_user_request_for_default_reply_agent,
                
                "invoke_default_reply_agent" : invoke_default_reply_agent,
                "default_reply_agent_output_formatter" : default_reply_agent_output_formatter,
                
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
                    "yes": "is_prompt_template_set_for_decider_agent", 
                    "no": "load_memory"
                }
            )
            
            graph.add_edge(
                "load_memory" , "error_checker5"
            )

            graph.add_conditional_edges(
                "error_checker5",
                error_checker, {
                    "success" : "is_prompt_template_set_for_decider_agent",
                    "error" : END
                } 
            )
            
            graph.add_conditional_edges(
                "is_prompt_template_set_for_decider_agent",
                is_prompt_template_set_for_decider_agent,
                {
                    "error": END, 
                    "yes": "set_prompt_for_user_request_for_decider_agent", 
                    "no": "set_prompt_template_for_decider_agent"
                }
            )
            
            graph.add_edge(
                "set_prompt_template_for_decider_agent" , "error_checker11"
            )
            
            graph.add_conditional_edges(
                "error_checker11",
                error_checker,
                {
                    "error": END, 
                    "success" : "set_prompt_for_user_request_for_decider_agent"
                }
            )
            
            graph.add_edge(
                "set_prompt_for_user_request_for_decider_agent" , "error_checker12"
            )
            
            graph.add_conditional_edges(
                "error_checker12",
                error_checker,
                {
                    "error": END, 
                    "success" : "invoke_decider_agent"
                }
            )
            
            graph.add_edge(
                "invoke_decider_agent" , "error_checker13"
            )

            graph.add_conditional_edges(
                "error_checker13", 
                error_checker,
                {
                    "error" : END,
                    "success" : "decider_agent_output_formatter"
                }
            )

            graph.add_edge(
                "decider_agent_output_formatter" , "error_checker14"
            )

            graph.add_conditional_edges(
                "error_checker14" , 
                error_checker,
                {
                    "success" : "decision_to_call_correct_agent",
                    "reinvoke" : "invoke_decider_agent",
                    "error" : END
                }
            )
            
            graph.add_conditional_edges(
                "decision_to_call_correct_agent" , 
                decision_to_call_correct_agent , 
                {
                    "ERROR" : END , 
                    "REASONING" : "load_relevant_workflows",
                    "DIRECT" : "is_prompt_template_set_for_default_reply_agent"
                }
            )
            
            graph.add_conditional_edges(
                "is_prompt_template_set_for_default_reply_agent" , 
                is_prompt_template_set_for_default_reply_agent,
                {
                    "error" : END,
                    "yes" : "set_prompt_for_user_request_for_default_reply_agent",
                    "no" : "set_prompt_template_for_default_reply_agent"
                }
            )
            
            graph.add_edge(
                "set_prompt_template_for_default_reply_agent" , "error_checker15"
            )
            
            graph.add_conditional_edges(
                "error_checker15",
                error_checker,
                {
                    "error" : END,
                    "success" : "set_prompt_for_user_request_for_default_reply_agent"
                }
            )
            
            graph.add_edge(
                "set_prompt_for_user_request_for_default_reply_agent" , "error_checker16"
            )
            
            graph.add_conditional_edges(
                "error_checker16",
                error_checker,
                {
                    "error" : END,
                    "success" : "invoke_default_reply_agent"
                }
            )
            
            graph.add_edge(
                "invoke_default_reply_agent" , "error_checker17"
            )

            graph.add_conditional_edges(
                "error_checker17",
                error_checker,
                {
                    "error" : END,
                    "success" : "default_reply_agent_output_formatter"
                }
            )
            
            graph.add_edge(
                "default_reply_agent_output_formatter" , "error_checker_last_for_default_reply_agent"
            )
            
            graph.add_conditional_edges(
                "error_checker_last_for_default_reply_agent" , 
                error_checker,
                {
                    "reinvoke" : "invoke_default_reply_agent" , 
                    "success" : END , 
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
                    "success": "is_prompt_template_set_for_reasoning_agent", 
                }
            )

            graph.add_conditional_edges(
                "is_prompt_template_set_for_reasoning_agent",
                is_prompt_template_set_for_reasoning_agent,
                {
                    "error" : END,
                    "yes" : "set_prompt_for_user_request_for_reasoning_agent",
                    "no" : "set_prompt_template_for_reasoning_agent"
                }
            )

            graph.add_edge(
                "set_prompt_template_for_reasoning_agent" , "error_checker7"
            )

            graph.add_conditional_edges(
                "error_checker7",
                error_checker,
                {
                    "success" : "set_prompt_for_user_request_for_reasoning_agent",
                    "error" : END
                }
            )

            graph.add_edge(
                "set_prompt_for_user_request_for_reasoning_agent" , "error_checker8"
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
                "reasoning_agent_output_formatter" , "error_checker_last_for_reasoning_agent"
            )

            graph.add_conditional_edges(
                "error_checker_last_for_reasoning_agent" , 
                error_checker,
                {
                    "success" : END,
                    "reinvoke" : "invoke_reasoning_agent",
                    "error" : END
                }
            )
            
            
            # print("\n\n setting up checkpointer\n\n") 
            
            if(is_redis_setup_done==False):
            
                await checkpointer.asetup()
                
                is_redis_setup_done = True
            
            compiled_graph = graph.compile(checkpointer=checkpointer)
            
            
            # print("itho paaru graph uh --->> ")

            with open("final_graph.png", "wb") as f:
                f.write(compiled_graph.get_graph().draw_png())
                
            return compiled_graph
    
    except Exception as e :
        
        # print("ennala mudila da ebba")
        
        print(e)


        
        

        
    
        
async def invoke_graph(data) : 
    
    # yield f"data: {json.dumps({"is_final" : "error" , "resp" : "Aama da error tha enna ipo"})}\n\n"
    # return
    
    try: 
        
        global compiled_graph
        
        
        if(compiled_graph == None) :
            
            # print("\n\n======================\n\n")
            # print("calling compile graph")
            
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
        
        # print(" i am here ")
        
        flag = False
        
        
        async for event in compiled_graph.astream(state, config={"configurable": {"thread_id": "test_thread"} , "recursion_limit" : 100}, stream_mode="updates"):
            
            
            try :
                
                
                Lists : dict = list(event.values())[0]
                
                reasoning_agent_response = Lists.get("formatted_response_from_reasoning_agent")
                
                default_reply_agent_response = Lists.get("formatted_response_from_default_reply_agent")
                
                status = Lists.get("status")
                
                message = Lists.get("message")
                
                filler_status_for_reasoning_agent = Lists.get("filler_status_for_reasoning_agent")
                
                filler_status_for_default_reply_agent = Lists.get("filler_status_for_default_reply_agent")
                
                # print("THO PAARU LIST UH -------------------->>>>>>>>>>>>>>>>")
                
                # print(Lists)

                
                
                if(reasoning_agent_response) : 
                    
                    # if(filler_status_for_default_reply_agent == "SUCCESS") : 
                    
                        reasoning_agent_response = reasoning_agent_response.model_dump_json(exclude_none = True)
                    
                        resp = {
                            "is_final" : "true" ,
                            "resp" : reasoning_agent_response
                        }
                        
                        yield f"data: {json.dumps(resp)}\n\n"
                        
                    # else :
                         
                    #     resp = {
                    #         "is_final" : "true" ,
                    #         "resp" : "Thothukite irukiye da"
                    #     }
                    #     yield f"data: {json.dumps(resp)}\n\n"
             
                        return
                
                if(default_reply_agent_response) : 
                    
                    # if(filler_status_for_default_reply_agent == "SUCCESS") : 
                    
                        # default_reply_agent_response = default_reply_agent_response.model_dump_json(exclude_none = True)
                        
                        resp = {
                            "is_final" : "error" ,
                            "resp" : default_reply_agent_response
                        }
                        
                        yield f"data: {json.dumps(resp)}\n\n"
                        
                    # else : 
                        
                    #     resp = {
                    #         "is_final" : "error" ,
                    #         "resp" : "Thothukite irukiye da"
                    #     }
                    #     yield f"data: {json.dumps(resp)}\n\n"
                        
                        
                
                        return

                
                if(status and status == "error") : 
                    
                    resp = {
                        "is_final" : "error" , 
                        "resp" : message
                    }
                    
                    yield f"data: {json.dumps(resp)}\n\n"

                    return 
                
                
                
                resp = {
                    "is_final" : "false" , 
                    "resp" : message
                }
                
                yield f"data: {json.dumps(resp)}\n\n"
          
                
                
                
            except Exception as e : 
                
                print("enna error thala")
                
                print(e)
                
                resp = {
                    "is_final" : "error" ,
                    "resp" : "some internal error happened"
                }
                
                yield f"data: {json.dumps(resp)}\n\n"
        
    except Exception as e : 
        
        # print("ada poya ")
        # print(e)
        
        value = {
            "is_final": "error" , 
            "value" : "some internal error happened"
        }
        yield f"data: {json.dumps(value)}\n\n"
    
        
# asyncio.run(main())