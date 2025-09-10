from ...lang_graph import State

async def is_loading_workflow_successful(state : State) -> str :
    
    try :
        
        if(state.status != "success"):
            return "error"
        
        return "yes"
    
    except Exception as e : 
        return "error"