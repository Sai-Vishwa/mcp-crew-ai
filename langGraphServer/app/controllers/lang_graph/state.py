


from typing import Any, Dict, List, Optional
from pydantic import BaseModel , Field


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

class ReasoningAgentResponse(BaseModel):
    is_new_workflow : bool
    workflow_id : int | None
    workflow_name : str
    workflow_description : str
    workflow_steps : List[Workflow]
    confidence_score : float
    reasoning : str

class State(BaseModel):
    user_input_id : int
    user_input : str
    user_session : str
    chat_session : str
    user_name : str
    is_new_chat : bool
    current_step : Workflow | None
    completed_tools : List[Workflow]
    current_tool_call_info : toolCallInfo | None
    completed_tool_calls_info : List[toolCallInfo]
    final_response : str
    is_memory_loaded : bool
    is_relevant_inputs_loaded : bool
    status : str
    message : str
    relevant_workflows : Dict[str , ReasoningAgentResponse] | None
    reasoning_agent_response : str | ReasoningAgentResponse
    is_valid_response : int
    additional_message_for_reasoning_agent : str
