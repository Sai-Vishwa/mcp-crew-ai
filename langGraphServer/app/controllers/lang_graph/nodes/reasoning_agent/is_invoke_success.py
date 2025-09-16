from ...state import State


async def is_invoke_success(state : State):
    try : 
        if(state.status != "success"):
            return "error"
        return "yes"
    except Exception as e:
        return "error"
    
def is_invoke_success_wrapper(state: State) :  
    state.message = "Checking if the reasoning agent invocation was successful"
    return state