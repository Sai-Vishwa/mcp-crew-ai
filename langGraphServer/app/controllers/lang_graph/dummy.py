from typing import Literal, TypedDict
import uuid

from langgraph.constants import START, END
from langgraph.graph import StateGraph
from langgraph.types import interrupt, Command , StateSnapshot
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from langgraph.checkpoint.redis.aio import AsyncRedisSaver

from langchain.embeddings import init_embeddings


class State(TypedDict):
    decision: str

def generate_llm_output(state: State) -> State:
    print("na 1st uh")
    return state

def human_approval(state: State) -> Command[Literal["approved_path", "rejected_path"]]:
    decision = interrupt({
        "question": "Do you approve the following output?",
    })

    if decision == "approve":
        return Command(goto="approved_path", update={"decision": "approved"})
    else:
        return Command(goto="rejected_path", update={"decision": "rejected"})

def approved_node(state: State) -> State:
    print("na 3rd uh")
    print("Approved path taken.")
    return state

def rejected_node(state: State) -> State:
    print("Rejected path taken.")
    return state

builder = StateGraph(State)
builder.add_node("generate_llm_output", generate_llm_output)
builder.add_node("human_approval", human_approval)
builder.add_node("approved_path", approved_node)
builder.add_node("rejected_path", rejected_node)

builder.set_entry_point("generate_llm_output")
builder.add_edge("generate_llm_output", "human_approval")
builder.add_edge("approved_path", END)
builder.add_edge("rejected_path", END)

checkpointer = InMemorySaver()
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": uuid.uuid4()}}
result = graph.invoke({"decision" : "na tha da meow"}, config=config)

id = (result['__interrupt__'][0].id)

result.pop('__interrupt__')

state_val = StateSnapshot(
    values = result,
    next= None,
    config=config,
    metadata={"decision": "approve"},
    created_at=None,
    parent_config=None,
    tasks=None,
    interrupts=None
)

# result["__interrupt__"]

print("na 2nd uh")
final_result = graph.invoke(Command(resume=state_val), config=config)
print(final_result)


