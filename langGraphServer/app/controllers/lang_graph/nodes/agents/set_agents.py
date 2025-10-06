from langchain_google_genai import ChatGoogleGenerativeAI
import os
from langchain.agents import initialize_agent , AgentType
from ..tools.set_tools import expose_tools
from ...state import FlagState
from langchain_openai import ChatOpenAI

llm = None
reasoning_agent = None
execution_agent = None     
decider_agent = None
default_reply_agent = None

async def set_agents(state : FlagState) -> FlagState:

    try:
                
        global llm
        global reasoning_agent
        global execution_agent
        global decider_agent
        global default_reply_agent

        Tools = expose_tools()
        
        # llm = ChatOpenAI(
        #      model="gpt-4o",
        #     temperature=0,
        #     max_tokens=None,
        #     timeout=None,
        #     max_retries=2,
        #     api_key=os.getenv("OPEN_API"),
            
        # )
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",  
            google_api_key=os.getenv("GEMINI_API"),
            temperature=0.2,
            max_output_tokens=1000,
        )
        
        decider_agent = initialize_agent(
            llm = llm,
            agent = AgentType.OPENAI_MULTI_FUNCTIONS,
            verbose = True,
            tools= [],
            handle_parsing_errors = True
        )
        
        default_reply_agent = initialize_agent(
            llm = llm,
            agent = AgentType.OPENAI_MULTI_FUNCTIONS,
            verbose = True,
            tools=[]
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
        "execution_agent" : execution_agent,
        "decider_agent" : decider_agent,
        "default_reply_agent" : default_reply_agent
    }
def expose_reasoning_agent():
    return reasoning_agent

def expose_execution_agent():
    return execution_agent

def expose_decider_agent():
    return decider_agent

def expose_default_reply_agent():
    return default_reply_agent