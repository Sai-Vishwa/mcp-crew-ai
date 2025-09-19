from typing import Literal, TypedDict
import uuid

from langgraph.constants import START, END
from langgraph.graph import StateGraph
from langgraph.types import interrupt, Command , StateSnapshot
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from langchain.embeddings import init_embeddings


class State1(TypedDict):
    count : int
    extra : str
    
class State2(TypedDict):
    counter : int
    

    

def node1(state: State1) -> State2:
    print(state)
    return {"counter" : state["count"]}

def node2(state: State1) -> State1:
    print(state)
    return {"Count" : state["counter"]}


builder = StateGraph(State1  ,input_schema= State1 , output_schema= State1)
builder.add_node("node1", node1)
builder.add_node("node2", node2)
builder.set_entry_point("node1")
builder.add_edge("node1", "node2")
builder.add_edge("node2", END)

graph = builder.compile()


final_result = graph.invoke({
    "count" : 5,
    "extra" : "na meow"
})
print(final_result)