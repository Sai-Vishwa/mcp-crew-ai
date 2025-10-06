from ...state import ReasoningAgentResponseState , FlagState , ReasoningAgentResponseFormat , DeciderAgentResponseState , DefaultReplyAgentResponseState
import json
from pprint import pprint

async def decider_agent_output_formatter(state : DefaultReplyAgentResponseState) -> FlagState:
    try : 
        
        if(type(state.raw_response_from_default_reply_agent) != str and type(state.raw_response_from_default_reply_agent) != dict):
            
            # print("actual type returned is ==> " , type(state.raw_response))
            return {
                "status": "error" ,
                "message": "Invalid output from decider agent ",
                "additional_message_for_default_reply_agent": "Provide a valid response ( in the expected response format )"
            }
            
        response = {}
        
        
        pprint(state.raw_response_from_default_reply_agent)
        
        if(type(state.raw_response_from_default_reply_agent) == dict) :
            
            response = state.raw_response_from_default_reply_agent
            
        else :
            
            response = json.loads(state.raw_response_from_default_reply_agent)
        
        response_str : str = response.get("output")
        
        cleaned = response_str.split("{", 1)[1].rsplit("}", 1)[0]
        
        cleaned = "{" + cleaned + "}"
        
        obj = json.loads(cleaned)
        
        cleaned = obj["final_response"]
        
            
        return {
            "status" : "success" , 
            "message" : "Default reply agent provided a valid response and is formatted successfully" , 
            "formatted_response_from_default_reply_agent" : cleaned
        }
            
        
    except Exception as e:
        
        print("error in formatting reasoning agent output")
        print(e)
        return {
            "status": "error" ,
            "message": "Invalid output from the default reply agent ",
            "additional_message_for_default_reply_agent": "Provide a valid response ( in the expected response format )"
        }