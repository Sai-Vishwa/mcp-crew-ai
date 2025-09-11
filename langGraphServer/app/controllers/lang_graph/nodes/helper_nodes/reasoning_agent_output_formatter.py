from ...state import State
import ast

async def reasoning_agent_output_formatter(state : State) -> str:
    try : 
        response = ast.literal_eval(state.reasoning_agent_response)
        if(state.status != "success"):
            return "error"
        is_valid = True
        
        
        if(len(response) != 1 or isinstance(response , dict) == False):
            is_valid = False
        
        workflow = response.get(state.user_input)
        
        if(workflow == None or isinstance(workflow , dict) == False or len(workflow))
        
    except Exception as e:
        return "error"