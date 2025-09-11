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
                        "message": f"Tool {tool.tool_name} not found in approved tools",
                    }
                    
        else :
            
            if(response_object.workflow_id is None or response_object.workflow_id not in state.relevant_workflows.values()):
                return {
                    "status": "error" ,
                    "message": "workflow_id is required when is_new_workflow is false",
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
        }