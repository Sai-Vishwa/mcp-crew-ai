from typing import Literal, TypedDict
import uuid

from langgraph.constants import START, END
from langgraph.graph import StateGraph
from langgraph.types import interrupt, Command , StateSnapshot
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from langchain.embeddings import init_embeddings
from pydantic import BaseModel , Field



class State1(TypedDict):
    count : int
    message : str
    
class State2(TypedDict):
    counter : int

class FlagState(BaseModel) : 
    status : str
    message : str
    

def node1(state: State1) -> FlagState:
    
    print("state of state 1")
    print(state)
    return {"counter" : 5000 , "status" : "success" , "message" : "unaku ellame vetri tha"}

def node2(state: FlagState ) -> State1:
    print("inga paaru thala")
    print(state)
    return {}




builder = StateGraph(State1  ,input_schema= State1 , output_schema= FlagState)
builder.add_node("node1", node1)
builder.add_node("node2", node2)
builder.set_entry_point("node1")
builder.add_edge("node1", "node2")
builder.add_edge("node2", END)

graph = builder.compile()


final_result = graph.invoke({
    "count" : 5,
    "extra" : "na meow",
    "message" : "enna aava potho"
})
print(final_result)