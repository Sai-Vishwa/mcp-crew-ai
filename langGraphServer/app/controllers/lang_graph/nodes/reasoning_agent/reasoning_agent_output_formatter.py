from ...state import ReasoningAgentResponseState , FlagState , ReasoningAgentResponseFormat
import json
from ..tools.set_tools import expose_tools

async def reasoning_agent_output_formatter(state : ReasoningAgentResponseState) -> FlagState:
    try : 
        
        if(type(state.raw_response) != str and type(state.raw_response) != dict):
            
            print("actual type returned is ==> " , type(state.raw_response))
            return {
                "status": "error" ,
                "message": "Invalid output from reasoning agent ",
                "additional_message_for_reasoning_agent": "Please provide the output in the correct format"
            }
            
        response = {}
            
        if(type(state.raw_response) == str ):
            response : dict = json.loads(state.raw_response)
        
        if(type(state.raw_response) == dict):
            response : dict = state.raw_response
        
        response_str : str = response.get("output")
        
        cleaned = response_str.split("{", 1)[1].rsplit("}", 1)[0]
        cleaned = "{" + cleaned + "}"        
        
        response = json.loads(cleaned)
        
        print("response from reasoning agent ==> " , response)
        
        Tools = expose_tools()
        
        
        response_object = ReasoningAgentResponseFormat(**response)
        
        print("response object ==> " , response_object)
        
        if(response_object.is_new_workflow == True):
            
            for tool in response_object.workflow_steps:
                if(tool.tool_name not in [t.name for t in Tools]):
                    return {
                        "status": "error" ,
                        "message": "invalid tool usage",
                        "additional_message": f"the tool {tool.tool_name} is not in the list of approved tools. Approved tools are {[t.name for t in Tools]}"
                    }
                    
        else :
            
            if(response_object.workflow_id is None or response_object.workflow_id < 1):
                return {
                    "status": "error" ,
                    "message": "workflow_id is required when is_new_workflow is false",
                    "additional_message": "Please provide a valid workflow_id from the approved workflows"
                }
                
            
        
        return {
            "status" : "success" , 
            "message" : "Successfully formatted the reasoning agent output",
            "formatted_response" : response_object,
            "additional_message" : ""
        }
        
        
    except Exception as e:
        
        print("error in formatting reasoning agent output")
        print(e)
        return {
            "status": "error" ,
            "message": "Invalid output from reasoning agent ",
            "additional_message": "Please provide the output in the correct format"
        }