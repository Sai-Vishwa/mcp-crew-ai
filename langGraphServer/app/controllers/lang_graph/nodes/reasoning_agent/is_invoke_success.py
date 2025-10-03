# from ...state import State , TemporaryHolderForReasoningAgentOutcome


# async def is_invoke_success(state : TemporaryHolderForReasoningAgentOutcome) -> str:
#     try : 
#         if(state.status != "success"):
#             return "error"
#         return "yes"
#     except Exception as e:
#         return "error"
    
# def is_invoke_success_wrapper(state: TemporaryHolderForReasoningAgentOutcome) -> TemporaryHolderForReasoningAgentOutcome:  
    
#     if(state.status != "success") :
#         return state
#     return {
#         "message" : "Checking if the reasoning agent invocation was successful"
#     }