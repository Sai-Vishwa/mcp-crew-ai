


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
    params_required: List[str]    
    
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
    chat_session : int
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
    reasoning_agent_response : str | ReasoningAgentResponse | dict | Any
    is_valid_response : int
    additional_message_for_reasoning_agent : str
    
class inputState(BaseModel):
    user_input : str
    user_session : str
    chat_session : int
    is_new_chat : bool
    message : str
    status : str
    
class flagState(BaseModel):
    message : str
    status : str
    
class loaderState(BaseModel):
    is_memory_loaded : bool 
    user_input_id : int
    user_input : str
    user_session : str
    chat_session : int
    user_name : str
    message : str
    status : str
    
class RelevantWorkFlowState(BaseModel) : 
    
    user_input : str
    workflow_generated : ReasoningAgentResponse
    
class ListOfRelevantWorkflowState(BaseModel):
    
    relevant_workflows : List[RelevantWorkFlowState]
    status : str
    message : str
    is_relevant_inputs_loaded : bool