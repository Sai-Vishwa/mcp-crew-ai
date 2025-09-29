from ...state import ReasoningAgentResponseState , FlagState

async def approved_path(state : ReasoningAgentResponseState) -> FlagState : 
    
    try : 
        
        return {
            "status" : "success" , 
            "message" : "hey thanks for approving... we will execute your workflow ( time kudu )"
        }
        
    except Exception as e : 
        
        print(e)
        
        return {
            "status" : "error" , 
            "message" : "nee approve panna... athu la execute panna maten"
        }