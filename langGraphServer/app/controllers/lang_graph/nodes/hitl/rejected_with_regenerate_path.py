from ...state import ReasoningAgentResponseState , FlagState

async def rejected_with_regenerate_path(state : ReasoningAgentResponseState) -> FlagState : 
    
    try : 
        
        return {
            "status" : "success" , 
            "message" : "Kasta pattu workflow va generate panna REJECT PANRA.. kettavan da nee"
        }
        
    except Exception as e : 
        
        print(e)
        
        return {
            "status" : "error" , 
            "message" : "nee ye reject tha panra.. aana athu la kooda error uh"
        }