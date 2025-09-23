from ...state import FlagState

def error_checker(state : FlagState) -> str :
    
    try : 
        
        if(state.status != 'success') : 
            return "error"
        
        return "success"
    
    except Exception as e : 
        
        print("ithu la enna da error varum")
        print(e)
        
        return "error"