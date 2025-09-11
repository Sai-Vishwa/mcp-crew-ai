from ...state import State
from langgraph.types import interrupt, Command
from typing import Literal, TypedDict


async def interrupt_to_user(state: State) -> Command[Literal["workflow_approved" , "workflow_rejected"]]:
    try :
        decision = interrupt({
            
        })
        return {}
    except Exception as e:
        return {
            
        }