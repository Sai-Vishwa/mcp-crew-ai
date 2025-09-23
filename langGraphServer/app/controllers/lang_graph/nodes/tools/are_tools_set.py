from .set_tools import expose_tools , expose_client 
from ...state import InputState , FlagState

async def are_tools_set(state : FlagState) -> str:
    try:
        Tools = expose_tools()
        client = expose_client()
        if(Tools is not None and client is not None):
            return "yes"
        elif(Tools is None or client is None):
            return "no"
        
    except Exception as e:
        print(e)
        return  "error"
    
def are_tools_set_wrapper(state: InputState) -> FlagState:
    return {"message" : "Checking if tools are set" , "status" : "success"}