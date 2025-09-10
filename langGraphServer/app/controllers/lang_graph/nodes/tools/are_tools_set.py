# lang_graph.py (top of the fil


from .set_tools import Tools ,client
from ...state import State



async def are_tools_set(state : State) -> str:
    try:
        if(Tools is not None and client is not None):
            return "yes"
        elif(Tools is None or client is None):
            return "no"
    except Exception as e:
        return  "error"