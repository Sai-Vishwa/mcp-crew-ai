from ...state import State

async def is_save_successful(state : State) -> str:
    
    try : 
        
        if(state.user_input_id <= 0 or state.status!="success"):
            return "error"
        
        else : 
            return "yes"
    
    except Exception as e : 
        return "error"