from ...state import ReasoningAgentInputState , FlagState

async def set_prompt_for_user_request(state : ReasoningAgentInputState) -> FlagState : 
    
    try :
        
        return {
            "status" : "success" , 
            "message" : "prompt is generated successfully"
        }
        
    except Exception as e :
         
        print(e)
        return {
            "status" : "error",
            "message" : "cannot generate a proper prompt for the user request"
        }