
from langchain_mcp_adapters.client import MultiServerMCPClient
from ...state import State

Tools = None

client = None


async def set_tools(state : State):
    try: 
        global client
        global Tools
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
        Tools = await client.get_tools()
        return {
            "status" : "success", 
            "message" : "Tools are successfully loaded in the Tools variable"
        }
    except Exception as e:
        return {
            "status" : "error",
            "message" : "Cannot load tools"
        }
        
def expose_tools():
    return Tools

def expose_client():
    return client