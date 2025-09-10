from ...lang_graph import State

async def is_relevant_workflow_loaded(state : State) -> str : 
    try: 
        
        if(state.status != "success") :
            return "error"
        
        if (state.is_relevant_inputs_loaded == False and len(state.relevant_workflows)==0):
            return "no"
            
        else:
            return "yes"
            
    except Exception as e:
        return  "error"