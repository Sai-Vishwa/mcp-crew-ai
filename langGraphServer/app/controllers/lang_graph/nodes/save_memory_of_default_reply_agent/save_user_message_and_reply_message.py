from ...state import DefaultReplyAgentResponseState , FlagState
from ..helpers.redis_connector import async_redis_client_provider
import json

async def save_user_message_and_reply_message(state : DefaultReplyAgentResponseState) -> FlagState : 
    
    try :
        
        async_redis_client = await async_redis_client_provider()
        
        await async_redis_client.execute_command("JSON.ARRAPPEND" , str(state.chat_id)+"MeowMemory" , json.dumps({"user_message" : state.user_input , "ai_message" : state.formatted_response_from_default_reply_agent}))
        
        return {
            "status" : "success" , 
            "message" : ""
        }
        
    except Exception as e :
        
        return {
            "status" : "error" , 
            "message" : "some internal error happened while saving the message... sorry the current workflow and action wont be recorded"
        }