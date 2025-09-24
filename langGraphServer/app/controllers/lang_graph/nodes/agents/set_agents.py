from langchain_google_genai import ChatGoogleGenerativeAI
import os
from langchain.agents import initialize_agent , AgentType
from ..tools.set_tools import expose_tools
from ...state import FlagState

llm = None
reasoning_agent = None
execution_agent = None     

async def set_agents(state : FlagState) -> FlagState:

    try:
                
        global llm
        global reasoning_agent
        global execution_agent

        Tools = expose_tools()
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",  
            google_api_key=os.getenv("GEMINI_API"),
            temperature=0.2,
            max_output_tokens=1000,
        )

        reasoning_agent = initialize_agent(
            llm= llm,
            agent= AgentType.OPENAI_MULTI_FUNCTIONS,
            verbose= True,
            tools=Tools,
                   )

        execution_agent = initialize_agent(
            llm= llm,
            agent= AgentType.OPENAI_MULTI_FUNCTIONS,
            verbose= True,
            tools=Tools,
                 )
        
        return {
            "status" : "success",
            "message" : "Agents are set up successfully"
        }

    except Exception as e:
        
        print(e)

        return {
            "status" : "error",
            "message" : "There is error in setting up agents"
        }

        
def expose_all():
    return {
        "reasoning_agent" : reasoning_agent,
        
        "llm" : llm,
        "execution_agent" : execution_agent
    }
def expose_reasoning_agent():
    return reasoning_agent

def expose_execution_agent():
    return execution_agent