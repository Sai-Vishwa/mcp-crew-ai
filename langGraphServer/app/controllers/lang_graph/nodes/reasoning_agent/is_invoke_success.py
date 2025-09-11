from langGraphServer.app.controllers.lang_graph.state import State


async def is_invoke_success(state : State):
    try : 
        if(state.status != "success"):
            return "error"
        return "yes"
    except Exception as e:
        return "error"