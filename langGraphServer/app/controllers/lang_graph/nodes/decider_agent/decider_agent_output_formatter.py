from ...state import ReasoningAgentResponseState , FlagState , ReasoningAgentResponseFormat , DeciderAgentResponseState
import json
from pprint import pprint

async def decider_agent_output_formatter(state : DeciderAgentResponseState) -> FlagState:
    try : 
        
        if(type(state.raw_response_from_decider_agent) != str and type(state.raw_response_from_decider_agent) != dict):
            
            # print("actual type returned is ==> " , type(state.raw_response))
            return {
                "status": "error" ,
                "message": "Invalid output from decider agent ",
                "additional_message_for_decider_agent": "Provide a sinlge word response -> REASONING / DIRECT"
            }
            
        response = ""
        
        
        pprint(state.raw_response_from_decider_agent)
            
        if(type(state.raw_response_from_decider_agent) == str ):
            response : str = state.raw_response_from_decider_agent
        
        if(type(state.raw_response_from_decider_agent) == dict):
            response : str = state.raw_response_from_decider_agent
        
        response_str : str = response.get("output")
        
        cleaned = response_str.split("{", 1)[1].rsplit("}", 1)[0]
        
        cleaned = "{" + cleaned + "}"
        
        obj = json.loads(cleaned)
        
        cleaned = obj["decision"]
        
        if(cleaned == "REASONING" or cleaned == "DIRECT") : 
            
            return {
                "status" : "success" , 
                "message" : "Decider agent provided a valid response and is formatted successfully" , 
                "formatted_response_from_decider_agent" : cleaned
            }
            
        return {
            "status" : "error" , 
            "message" : "Decider agent provided an invalid response" , 
            "additional_message_for_decider_agent" : "Provide a sinlge word response -> REASONING / DIRECT"
        }
        
        
    except Exception as e:
        
        print("error in formatting reasoning agent output")
        print(e)
        return {
            "status": "error" ,
            "message": "Invalid output from reasoning agent ",
            "additional_message_for_decider_agent": "Provide a sinlge word response -> REASONING / DIRECT"
        }