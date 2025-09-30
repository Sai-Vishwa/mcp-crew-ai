# from ...state import State , ReasoningAgentResponse , ListOfRelevantWorkflowState

# async def is_reinvoke_required(state : ListOfRelevantWorkflowState) -> str:
#     try : 
#         if(state.status != "success"):
#             return "error"
#         return "no"
#     except Exception as e:
#         return "error"
    
# def is_reinvoke_required_wrapper(state: ReasoningAgentResponse) -> ListOfRelevantWorkflowState:
    
    
#     message = state.message
#     additional_message_for_reasoning_agent = ""
#     if(state.status != "success") :
#         additional_message_for_reasoning_agent = state.additional_message_for_reasoning_agent
#     else:
#         message = "Checking whether re-invoke of the reasoning agent is required"

#     return {
#         "status" : state.status , 
#         "message" : message , 
#         "additional_message_for_reasoning_agent" : additional_message_for_reasoning_agent
#     }
