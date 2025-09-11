from ...state import State,ReasoningAgentResponse
import json
from ..tools.set_tools import Tools

async def reasoning_agent_output_formatter(state : State):
    try : 
        
        
        response = json.loads(state.reasoning_agent_response)
        
        response_object = ReasoningAgentResponse(**response)
        
        if(response_object.is_new_workflow == True):
            
            for tool in response_object.workflow_steps:
                if(tool.tool_name not in [t.name for t in Tools]):
                    return {
                        "status": "error" ,
                        "message": "invalid tool usage",
                        "additional_message_for_reasoning_agent": f"the tool {tool.tool_name} is not in the list of approved tools. Approved tools are {[t.name for t in Tools]}"
                    }
                    
        else :
            
            if(response_object.workflow_id is None or response_object.workflow_id not in state.relevant_workflows.values()):
                return {
                    "status": "error" ,
                    "message": "workflow_id is required when is_new_workflow is false",
                    "additional_message_for_reasoning_agent": "Please provide a valid workflow_id from the approved workflows"
                }
                
            
        
        return {
            "status" : "success" , 
            "message" : "Successfully formatted the reasoning agent output",
            "reasoning_agent_response" : response_object
        }
        
        
    except Exception as e:
        return {
            "status ": "error" ,
            "message ": "Invalid output from reasoning agent ",
            "additional_message_for_reasoning_agent": "Please provide the output in the correct format"
        }