


from typing import Any, Dict, List, Optional
from pydantic import BaseModel


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
    status : str
    message : str
    relevant_workflows : Dict[str , List[Workflow]]
    reasoning_agent_response : str
