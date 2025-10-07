from ...state import ReasoningAgentResponseState , FlagState , ReasoningAgentResponseFormat , DeciderAgentResponseState , DefaultReplyAgentResponseState
import json
from pprint import pprint
import re

async def default_reply_agent_output_formatter(state : DefaultReplyAgentResponseState) -> FlagState:
    try : 
        
        if(type(state.raw_response_from_default_reply_agent) != str and type(state.raw_response_from_default_reply_agent) != dict):
            
            # print("actual type returned is ==> " , type(state.raw_response))
            return {
                "status": "reinvoke" ,
                "message": "Invalid output from default reply agent agent ",
                "additional_message_for_default_reply_agent": "Provide a valid response ( in the expected response format )",
                "filler_status_for_default_reply_agent" : "FAILURE"

            }
            
        response = {}
        
        
        # pprint(state.raw_response_from_default_reply_agent)
        
        if(type(state.raw_response_from_default_reply_agent) == dict) :
            
            response = state.raw_response_from_default_reply_agent
            
        else :
            
            response = json.loads(state.raw_response_from_default_reply_agent)
        
        response_str : str = response.get("output")
        
        response_str = re.sub(r'(\b\w+\b):', r'"\1":', response_str)

# Now it's valid JSON
        obj = json.loads(response_str)

        cleaned = obj["final_response"]
        
            
        return {
            "status" : "reinvoke" , 
            "message" : "Default reply agent provided a valid response and is formatted successfully" , 
            "formatted_response_from_default_reply_agent" : cleaned,
            "filler_status_for_default_reply_agent" : "SUCCESS"

        }
            
        
    except Exception as e:
        
        # print("error in formatting default reply agent output")
        # print(e)
        return {
            "status": "reinvoke" ,
            "message": "Invalid output from the default reply agent ",
            "additional_message_for_default_reply_agent": "Provide a valid response ( in the expected response format )",
            "filler_status_for_default_reply_agent" : "FAILURE"
        }