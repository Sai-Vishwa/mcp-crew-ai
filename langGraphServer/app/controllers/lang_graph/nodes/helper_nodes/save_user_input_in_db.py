from ...state import State
import httpx

async def save_user_input_in_db(state : State):
    try : 
        
        async with httpx.AsyncClient() as client:
                
                response = await client.post("http://localhost:4004/save_user_input", json={"user_session" : state.user_session , "chat_session" : state.chat_session , "prompt" : state.user_input})
                resp = response.json()
                
                if resp["status"] == "error":
                    return {
                        "status" : "error" , 
                        "message" : "Cannot save user input in db" ,
                        "user_input_id" : -2 
                    }
                
                input_id = resp["input_id"]
                
                
                return {
                    "status" : "success" ,
                    "message" : "The user input is saved in the db",
                    "user_input_id"  :input_id
                }
                
    except Exception as e :
        
        return {
            "status" : "error" , 
            "message" : "some error occured while inserting user prompt into db",
            "user_input_id" : -2
        }