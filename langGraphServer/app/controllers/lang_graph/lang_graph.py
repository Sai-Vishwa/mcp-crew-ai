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
from typing import List , Dict
import httpx
from flask import jsonify
from cachetools import TTLCache
from typing import TypedDict , NotRequired , Any , Optional
from langgraph.graph import StateGraph , END , START

# lang_graph.py (top of the file)
import sys
from pathlib import Path

# Add the parent folder to sys.path
sys.path.append(str(Path(__file__).parent.parent.resolve()))



from lang_graph.nodes.tools.are_tools_set import are_tools_set , are_tools_set_wrapper
from lang_graph.nodes.tools.set_tools import set_tools
from lang_graph.nodes.agents.are_agents_set import are_agents_set , are_agents_set_wrapper
from lang_graph.nodes.agents.set_agents import set_agents
from lang_graph.nodes.loading_memory.is_memory_loaded import is_memory_loaded , is_memory_loaded_wrapper
from lang_graph.nodes.loading_memory.load_memory import load_memory
from lang_graph.nodes.requestValidation.is_new_chat import is_new_chat , is_new_chat_wrapper
from lang_graph.nodes.requestValidation.is_valid_user_session_for_new_chat import is_valid_user_session_for_new_chat
from lang_graph.nodes.requestValidation.is_valid_user_session_for_old_chat import is_valid_user_session_for_old_chat
from lang_graph.nodes.loading_relevant_workflows.is_loading_workflow_successful import is_loading_workflow_successful , is_loading_workflow_successful_wrapper
from lang_graph.nodes.loading_relevant_workflows.is_relevant_workflow_loaded import is_relevant_workflow_loaded , is_relevant_workflow_loaded_wrapper
from lang_graph.nodes.loading_relevant_workflows.load_relevant_workflows import load_relevant_workflows
from lang_graph.nodes.reasoning_agent.invoke_reasoning_agent import invoke_reasoning_agent
from lang_graph.nodes.reasoning_agent.is_invoke_success import is_invoke_success , is_invoke_success_wrapper
from lang_graph.nodes.reasoning_agent.is_reinvoke_required import is_reinvoke_required ,is_reinvoke_required_wrapper
from lang_graph.nodes.reasoning_agent.reasoning_agent_output_formatter import reasoning_agent_output_formatter
from lang_graph.nodes.requestValidation.is_new_workflow import is_new_workflow , is_new_workflow_wrapper
from lang_graph.state import State , Workflow , toolCallInfo


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

def date_clash_checker(placements : list , exams : list , date : str) -> str:
    return f"Clash um ila oru mannum ila"

date_clash_checker_tool = StructuredTool.from_function(
    func=date_clash_checker,
    name="DateClashChecker",
    description="With a lsit of all placement entries or with a list of all exam entries provided the tool checks for clash in a specific date",
    args_schema=ExamInput
)























graph = StateGraph(State)


# graph.add_node(START)
# graph.add_node(END)

    
nodes = {
    are_tools_set_wrapper : "are_tools_set",
    set_tools : "set_tools", 
    are_agents_set_wrapper : "are_agents_set", 
    set_agents : "set_agents",
    is_new_chat_wrapper : "is_new_chat",
    is_valid_user_session_for_old_chat : "is_valid_user_session_for_old_chat",
    is_valid_user_session_for_new_chat :"is_valid_user_session_for_new_chat",
    is_memory_loaded_wrapper :"is_memory_loaded",
    load_memory : "load_memory", 
    is_relevant_workflow_loaded_wrapper : "is_relevant_workflow_loaded",
    load_relevant_workflows :"load_relevant_workflows",
    is_loading_workflow_successful_wrapper : "is_loading_workflow_successful",
    invoke_reasoning_agent : "invoke_reasoning_agent",
    is_invoke_success_wrapper : "is_invoke_success",
    is_reinvoke_required_wrapper : "is_reinvoke_required",
    reasoning_agent_output_formatter : "reasoning_agent_output_formatter"
}

for key,value in nodes.items():
    graph.add_node(value , key)



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
    "set_tools", "are_agents_set"
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
    "set_agents", "is_new_chat"
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
    "is_valid_user_session_for_new_chat", "is_memory_loaded"
)

graph.add_edge(
    "is_valid_user_session_for_old_chat", "is_memory_loaded"
)

graph.add_conditional_edges(
    "is_memory_loaded",
    is_memory_loaded,
    {
        "error": END, 
        "yes": "is_relevant_workflow_loaded", 
        "no": "load_memory"
    }
)

graph.add_edge(
    "load_memory", "is_relevant_workflow_loaded"
)

graph.add_conditional_edges(
    "is_relevant_workflow_loaded",
    is_relevant_workflow_loaded,
    {
        "error": END, 
        "yes": "invoke_reasoning_agent",
        "no": "load_relevant_workflows"
    }
)

graph.add_edge(
    "load_relevant_workflows", "is_loading_workflow_successful"
)

graph.add_conditional_edges(
    "is_loading_workflow_successful",
    is_loading_workflow_successful,
    {
        "error": END, 
        "yes": "invoke_reasoning_agent", 
        "no": END
    }
)

graph.add_edge(
    "invoke_reasoning_agent" , "is_invoke_success"
)

graph.add_conditional_edges(
    "is_invoke_success" , 
    is_invoke_success,
    {
        "error" : END,
        "yes" : "reasoning_agent_output_formatter"
    }
)

graph.add_edge(
    "reasoning_agent_output_formatter" , "is_reinvoke_required"
)

graph.add_conditional_edges(
    "is_reinvoke_required" , 
    is_reinvoke_required,
    {
        "no" : END,
        "error" : "invoke_reasoning_agent"
    }
)

compiled_graph = graph.compile()

try:
   with open("graph.png", "wb") as f:
        f.write(compiled_graph.get_graph().draw_mermaid_png())
        
except Exception as e :
    print("pongada")
    
async def main():
    
    dummy_state = State(
    user_input_id=1,
    user_input="Find restaurants nearby",
    user_session="sess_123",
    chat_session="chat_456",
    user_name="Leo",
    is_new_chat=True,
    current_step=None,
    completed_tools=[],
    current_tool_call_info=None,
    completed_tool_calls_info=[],
    final_response="",
    is_memory_loaded=False,
    is_relevant_inputs_loaded=False,
    status="success",
    message="",
    relevant_workflows={},
    reasoning_agent_response="",
    is_valid_response=0,
    additional_message_for_reasoning_agent=""
)
    async for event in compiled_graph.astream(dummy_state, config={"configurable": {"thread_id": "test_thread"}}):
        print(event.keys())
        print()
        print(list(event.values())[0]["message"])
        print()
        print()
        
asyncio.run(main())