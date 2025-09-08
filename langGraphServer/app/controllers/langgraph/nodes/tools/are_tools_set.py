from set_tools import Tools , set_tools

def are_tools_set():
    try:
        if(len(Tools)>0):
            return {
                "status" : "success",
                "message" : "Tools are set",
                "response" : "yes"
            }
        elif(len(Tools)==0):
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