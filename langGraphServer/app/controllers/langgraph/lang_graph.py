from typing import Annotated

from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

import os
from langchain.chat_models import init_chat_model

from IPython.display import Image, display


os.environ["OPENAI_API_KEY"] = "sk-..."

# llm = init_chat_model("openai:gpt-4.1")


class State(TypedDict):
    userRequest: str
    previousMessages: list[dict]
    toolsUsed: list[dict]
    toolsOutput: list[dict]
    intermediateResponse: str
    finalResponse: str


def chatbot(state: State) -> State :
        state["finalResponse"] = "Vanakkam bha"
        return state


# The first argument is the unique node name
# The second argument is the function or object that will be called whenever
# the node is used.

graph_builder = StateGraph(State)

graph_builder.add_node("chatbot", chatbot)


graph_builder.add_edge(START, "chatbot")

graph_builder.add_edge("chatbot", END)

graph = graph_builder.compile()

res = graph.invoke({
    "userRequest": "Hlo",
    "previousMessages": [],
    "toolsUsed": [],
    "toolsOutput": [],
    "finalResponse": "",
})

print(res)

try:
   with open("graph.png", "wb") as f:
    f.write(graph.get_graph().draw_mermaid_png())

# then display or open manually
#    display(Image(filename="graph.png"))


except Exception:
    # This requires some extra dependencies and is optional
    pass

