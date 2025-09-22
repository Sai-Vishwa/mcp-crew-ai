from ...state import State , loaderState , ListOfRelevantWorkflowState

async def is_relevant_workflow_loaded(state : ListOfRelevantWorkflowState) -> str : 
    try: 
        
        if(state.status != "success") :
            return "error"
        
        if (state.is_relevant_inputs_loaded == False or len(state.relevant_workflows)==0):
            return "no"
            
        else:
            return "yes"
            
    except Exception as e:
        print("itho paathuten ")
        print(e)
        return  "error"
    
    
    
def is_relevant_workflow_loaded_wrapper(state: loaderState) -> ListOfRelevantWorkflowState:
    message = "Checking if relevant workflows are loaded"
    if(state.status != "success") :
        message = state.message
    return {
        "status" : state.status ,
        "message" :  message , 
        "relevant_workflows" : [] , 
        "is_relevant_inputs_loaded" : False
    }