from ...state import ReasoningAgentResponseState , FlagState , ReasoningAgentResponseFormat
import json
from ..tools.set_tools import expose_tools

async def reasoning_agent_output_formatter(state : ReasoningAgentResponseState) -> FlagState:
    try : 
        
        if(type(state.raw_response_from_reasoning_agent) != str and type(state.raw_response_from_reasoning_agent) != dict):
            
            # print("actual type returned is ==> " , type(state.raw_response))
            return {
                "status": "reinvoke" ,
                "message": "Invalid output from reasoning agent ",
                "additional_message_for_reasoning_agent": "Please provide the output in the correct format",
                "filler_status_for_reasoning_agent" : "FAILURE"
            }
            
        response = {}
            
        if(type(state.raw_response_from_reasoning_agent) == str ):
            response : dict = json.loads(state.raw_response_from_reasoning_agent)
        
        if(type(state.raw_response_from_reasoning_agent) == dict):
            response : dict = state.raw_response_from_reasoning_agent
        
        response_str : str = response.get("output")
        
        cleaned = response_str.split("{", 1)[1].rsplit("}", 1)[0]
        cleaned = "{" + cleaned + "}"        
        
        response = json.loads(cleaned)
        
        # print("response from reasoning agent ==> " , response)
        
        Tools = expose_tools()
        
        
        response_object = ReasoningAgentResponseFormat(**response)
        
        # print("response object ==> " , response_object)
        
        if(response_object.is_new_workflow == True):
            
            for tool in response_object.workflow_steps:
                if(tool.tool_name not in [t.name for t in Tools]):
                    return {
                        "status": "reinvoke" ,
                        "message": "invalid tool usage",
                        "additional_message_for_reasoning_agent": f"the tool {tool.tool_name} is not in the list of approved tools. Approved tools are {[t.name for t in Tools]}",
                        "filler_status_for_reasoning_agent" : "FAILURE"
                    }
                    
        else :
            
            if(response_object.workflow_id is None or response_object.workflow_id < 1):
                return {
                    "status": "reinvoke" ,
                    "message": "workflow_id is required when is_new_workflow is false",
                    "additional_message_for_reasoning_agent": "Please provide a valid workflow_id from the approved workflows",
                    "filler_status_for_reasoning_agent" : "FAILURE"
                }
                
            
        
        return {
            "status" : "success" , 
            "message" : "Successfully formatted the reasoning agent output",
            "formatted_response_from_reasoning_agent" : response_object,
            "additional_message_for_reasoning_agent" : "",
            "filler_status_for_reasoning_agent" : "SUCCESS"
        }
        
        
    except Exception as e:
        
        print("error in formatting reasoning agent output")
        print(e)
        return {
            "status": "reinvoke" ,
            "message": "Invalid output from reasoning agent ",
            "additional_message_for_reasoning_agent": "Please provide the output in the correct format",
            "filler_status_for_reasoning_agent" : "FAILURE"
        }