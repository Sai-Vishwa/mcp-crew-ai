from typing import Literal, TypedDict , Optional
import uuid

from langgraph.constants import START, END
from langgraph.graph import StateGraph
from langgraph.types import interrupt, Command , StateSnapshot
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from langchain.embeddings import init_embeddings
from pydantic import BaseModel , Field

from langgraph.checkpoint.redis.aio import AsyncRedisSaver

import asyncio




class State1(BaseModel):
    state1 : str
    
class State2(BaseModel):
    state2 : Optional[str] = ""

class State3(BaseModel) : 
    state3 : str
    

def node1(state: State1) -> State3:
    
    print("state of node 1")
    print(state)
    return {"state3" : "Na tha state 3 oda value"}

def node2(state:  State2) -> State3:
    print("state of node 2")
    print(state)
    return {
        "state3" : "Na tha state 3 oda new value"
    }

def node3(state : State3) -> State1 : 
    print("state of node 3")
    print(state) 
    return {
        "state2" : "na onu dummy ila da"
    }
    
def interrupt_function(state: State1) -> Command[Literal["node4" ,"node5" , "node6"]]:
    decision = interrupt({
        "question": "Do you approve the following output?",
    })

    if decision == "node4":
        return Command(goto="node4", update={"decision": "node4"})
    if decision == "node5":
        return Command(goto="node5", update={"decision": "node5"})
    else:
        return Command(goto="node6", update={"decision": "node6"})

def node4(state : State2) -> State3:
    
    print("inga paaru node 4 ah")
    print(state)
    return 
    
def node5(state : State1) -> State3 : 
    
    print("inga paaru node 5 ah")
    print(state)
    return
    
def node6(state : State3) -> State3 : 
     print("inga paaru node 6 ah")
     print(state) 
     return



DB_URI = "redis://localhost:6380/0"

async def compile():
        
    async with (AsyncRedisSaver.from_conn_string(DB_URI) as checkpointer) :
        
        await checkpointer.asetup()

        builder = StateGraph(State1  ,input_schema= State1 , output_schema= State3)
        builder.add_node("node1", node1)
        builder.add_node("node2", node2)
        builder.add_node("node3", node3)
        builder.add_node("node4", node4)        
        builder.add_node("node5", node5)
        builder.add_node("node6", node6)
        builder.add_node("interrupt_function" ,interrupt_function)
        builder.set_entry_point("node1")
        builder.add_edge("node1", "node2")
        builder.add_edge("node2", "node3")
        builder.add_edge("node3", "interrupt_function")
        builder.add_edge("node4", END)
        builder.add_edge("node5", END)
        builder.add_edge("node6" , END)


        graph = builder.compile(checkpointer=checkpointer)
        
        state = State1(
            state1= "Na tha initial state 1 uh"
        )
        
        async for event in graph.astream(state, config={"configurable": {"thread_id": "test_thread_vro_ithu"} , "recursion_limit" : 100}, stream_mode="updates"):
            
            if isinstance(event, dict) and "__interrupt__" in event.get("data", {}):
                print("Interrupt detected:", event["data"]["__interrupt__"])
                # stop current loop
                break
            
            
            print("THIS IS EVENT")
            print(event)
            
        async for event2 in graph.astream(Command(resume="node6"),config={"configurable": {"thread_id": "test_thread_vro_ithu"} , "recursion_limit" : 100},stream_mode="updates"):
            
            print("THIS IS EVENT 2")
            print(event2)

        
        
        
async def main():
    
    await compile()
    
asyncio.run(main())