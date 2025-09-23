from ...state import State , ListOfRelevantWorkflowState

async def is_loading_workflow_successful(state : ListOfRelevantWorkflowState) -> str :
    
    try :
        
        if(state.status != "success"):
            return "error"
        
        return "yes"
    
    except Exception as e : 
        return "error"
    
def is_loading_workflow_successful_wrapper(state: ListOfRelevantWorkflowState) -> ListOfRelevantWorkflowState:
    return state