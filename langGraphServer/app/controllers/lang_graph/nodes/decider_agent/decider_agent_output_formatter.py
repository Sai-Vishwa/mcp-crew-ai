from ...state import ReasoningAgentResponseState , FlagState , ReasoningAgentResponseFormat , DeciderAgentResponseState
import json
from pprint import pprint

async def decider_agent_output_formatter(state : DeciderAgentResponseState) -> FlagState:
    try : 
        
        if(type(state.raw_response_from_decider_agent) != str and type(state.raw_response_from_decider_agent) != dict):
            
            print("INGA PAARU REINVOKE COZ NOT A STR OR DICT")
            
            # print("actual type returned is ==> " , type(state.raw_response))
            return {
                "status": "reinvoke" ,
                "message": "Invalid output from decider agent ",
                "additional_messages_for_decider_agent": "Provide a sinlge word response -> REASONING / DIRECT"
            }
            
        response = ""
        
        
        # pprint(state.raw_response_from_decider_agent)
            
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
            
            print("INGA PAARU INVOKE SUCCESS")
            
            return {
                "status" : "success" , 
                "message" : "Decider agent provided a valid response and is formatted successfully" , 
                "formatted_response_from_decider_agent" : cleaned
            }
            
            
        print("INGA PAARU REINVOKE")
        print(cleaned)
        
        return {
            "status" : "reinvoke" , 
            "message" : "Decider agent provided an invalid response" , 
            "additional_messages_for_decider_agent" : "Provide a sinlge word response -> REASONING / DIRECT"
        }
        
        
    except Exception as e:
        
        print("INGA PAARU REINVOKE COZ OF ERROR")
        print(e)
        
        # print("error in formatting decider agent output")
        # print(e)
        return {
            "status": "reinvoke" ,
            "message": "Invalid output from DECIDER agent ",
            "additional_messages_for_decider_agent": "Provide a sinlge word response -> REASONING / DIRECT"
        }