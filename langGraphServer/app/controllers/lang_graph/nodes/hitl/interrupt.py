from ...state import ReasoningAgentResponseState , FlagState
from typing import Literal, TypedDict
from langgraph.types import interrupt, Command , StateSnapshot
from langgraph.checkpoint.redis.aio import AsyncRedisSaver



async def interrupt(state : ReasoningAgentResponseState) -> Command[Literal["approved_path", "rejected_with_regenrate_path" ,"rejected_path"]]: 
    
    try : 
        
        decision = interrupt({
        "question": "Do you approve the following workflow ???  Remember you are responsible for this",
        })

        if decision == "approve":
            return Command(goto="approved_path", update={"decision": "approved"})
        elif decision == "regenerate" : 
            return Command(goto="regenerate_path", update={"decision": "regenrate"})
        else:
            return Command(goto="rejected_path", update={"decision": "rejected"})

        
        
    except Exception as e : 
        
        print(e)
        return {
            "status" : "error" , 
            "message" : "cannot interrupt the graph... etho prechana thala"
        }
