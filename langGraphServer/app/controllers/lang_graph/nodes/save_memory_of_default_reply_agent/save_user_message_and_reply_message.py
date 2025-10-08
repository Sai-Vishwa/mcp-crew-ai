from ...state import DefaultReplyAgentResponseState , FlagState

async def save_user_message_and_reply_message(state : DefaultReplyAgentResponseState) -> FlagState : 
    
    try :
        
        return {
            "status" : "success" , 
            "message" : ""
        }
        
    except Exception as e :
        
        return {
            "status" : "error" , 
            "message" : "some internal error happened while saving the message... sorry the current workflow and action wont be recorded"
        }