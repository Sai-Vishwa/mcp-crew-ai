from ...state import State

async def is_reinvoke_required(state : State):
    try : 
        if(state.status != "success"):
            return "error"
        return "no"
    except Exception as e:
        return "error"