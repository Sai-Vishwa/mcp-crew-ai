from set_tools import Tools , set_tools

async def are_tools_set():
    try:
        if(Tools is not None):
            return {
                "status" : "success",
                "message" : "Tools are set",
                "response" : "yes"
            }
        elif(Tools is None):
            return {
                "status" : "success",
                "message" : "Tools are not set",
                "response" : "no"
            }
    except Exception as e:
        return  {
            "status" : "error",
            "message" : "Some internal error in accessing Tools variable"
        }