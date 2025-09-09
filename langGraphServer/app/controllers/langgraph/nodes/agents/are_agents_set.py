from set_agents import reasoning_agent , reasoning_agent_with_memory , store , dev_prompt_reasoning_agent , dev_prompt_execution_agent , llm , execution_agent

async def are_agents_set():
    try: 
        if(reasoning_agent_with_memory is None or store is None or reasoning_agent is None or dev_prompt_execution_agent is None or execution_agent is None or llm is None or dev_prompt_reasoning_agent is None):
            
            return {
                "status" : "success",
                "message" : "Agents are not set",
                "response" : "no"
            }
            
        else:
            return {
                "status" : "success",
                "message" : "Agents are set",
                "response" : "yes"
            }
            
    except Exception as e:
        return  {
            "status" : "error",
            "message" : "Some internal error in accessing Tools variable"
        }