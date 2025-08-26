# from typing import Annotated

# from typing_extensions import TypedDict

# from langgraph.graph import StateGraph, START, END
# from langgraph.graph.message import add_messages

import asyncio
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient(
    {
        "transport": {
            "url": "http://localhost:4007/mcp",
            "transport": "streamable_http",
        },
        "exam_cell": {
            "url": "http://localhost:4008/mcp",
            "transport": "streamable_http",
        },
        "placment": {
            "url": "http://localhost:4009/mcp", 
            "transport": "streamable_http",
        }
    }
)



async def get_mcp_tools():
    tools = await client.get_tools()
    print("these are the tools")
    print(len(tools))






# from langchain_xai import ChatXAI

# from langchain_core.messages import HumanMessage, AIMessage

# from langchain.chat_models import init_chat_model

# from IPython.display import Image, display

# import os
# from dotenv import load_dotenv

# # Load variables from .env into environment
# load_dotenv()


# get_mcp_tools()
# # reasoning_llm = ChatXAI(
# #     model="llama3-8b-8192",
# #     xai_api_key=os.getenv("GROK_API"),
# #     base_url="https://api.groq.com/openai/v1",
# #     temperature=0.7,
# #     max_tokens=1000
# # )

# # execution_llm = ChatXAI(
# #     model="llama3-8b-8192",
# #     xai_api_key=os.getenv("GROK_API"),
# #     base_url="https://api.groq.com/openai/v1",
# #     temperature=0.7,
# #     max_tokens=1000,
# # )


# # class State(TypedDict):
# #     userRequest: str
# #     previousMessages: list[dict]
# #     toolsUsed: list[dict]
# #     toolsOutput: list[dict]
# #     intermediateResponse: str
# #     finalResponse: str


# # def chatbot(state: State) -> State :
# #         state["finalResponse"] = "Vanakkam bha"
# #         return state


# # def router(state: State) -> str :
# #     str = ""
# #     if "exam" in state["userRequest"].lower():
# #         str = "exam_cell"
# #     elif "place" in state["userRequest"].lower():
# #         str = "placment"
# #     elif "transport" in state["userRequest"].lower():
# #         str = "transport"
# #     else:
# #         str = "chatbot"
# #     return str


# # def exam_cell(state: State) -> State :
# #     prompt = state["userRequest"] + state["intermediateResponse"] + " based on the previous messages " + str(state["previousMessages"])
# #     response = exam_cell_llm.invoke([prompt])
# #     state["intermediateResponse"] += response.content
# #     return state


# # def placement(state: State) -> State :
# #     prompt = state["userRequest"] + state["intermediateResponse"] + " based on the previous messages " + str(state["previousMessages"])
# #     response = exam_cell_llm.invoke([prompt])
# #     state["intermediateResponse"] += response.content
# #     return state


# # def transport(state: State) -> State :
# #     prompt = state["userRequest"] + state["intermediateResponse"] + " based on the previous messages " + str(state["previousMessages"])
# #     response = exam_cell_llm.invoke([prompt])
# #     state["intermediateResponse"] += response.content
# #     state["finalResponse"] = response.content
# #     return state



# # graph_builder = StateGraph(State)

# # graph_builder.add_node("chatbot", chatbot)
# # graph_builder.add_node("router", router)



# # graph_builder.add_edge(START, router)

# # graph_builder.add_conditional_edges(
# #     router,
# #     {"exam_cell": "exam_cell",
# #      "placment": "placment",
# #      "transport": "transport",
# #      "chatbot": "chatbot"}
# # )

# # graph_builder.add_edge("chatbot", END)

# # graph = graph_builder.compile()

# # res = graph.invoke({
# #     "userRequest": "Hlo",
# #     "previousMessages": [],
# #     "toolsUsed": [],
# #     "toolsOutput": [],
# #     "finalResponse": "",
# # })

# # print(res)

# # try:
# #    with open("graph.png", "wb") as f:
# #     f.write(graph.get_graph().draw_mermaid_png())

# # # then display or open manually
# # #    display(Image(filename="graph.png"))


# # except Exception:
# #     # This requires some extra dependencies and is optional
# #     pass



async def main():
    await get_mcp_tools()
    
asyncio.run(main())
