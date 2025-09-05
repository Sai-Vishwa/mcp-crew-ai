import { connectSlave } from "../connector/connectSlave.js";

interface respType {
    uname : string
}

async function chatChecker(userName : string , chatSession : string) {
    try{
        const connectionSlave =  await connectSlave();
        const [resp]= await connectionSlave.execute("select uname from chathistory where chatid=?",[chatSession])
        const Response : respType[] = resp as respType[]
        if(Response[0].uname === userName){
            return {
                status : "success",
            }
        }
        return {
            status : "error",
            message : "The chatsession does not belong to the user"
        }
    }
    catch(err : unknown){
        return {
            status : "error" , 
            message : "internal error"
        }
    }
}

export default chatChecker;