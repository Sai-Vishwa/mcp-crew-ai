from ...state import FlagState

    
def is_relevant_workflow_loaded_wrapper(state: FlagState) -> FlagState:
    message = "Loading Relevant Workflows"
    if(state.status != "success") :
        message = state.message
    return {
        "status" : state.status ,
        "message" :  message , 
    }