
import { Request , Response } from "express"
import sessionChecker from "../../helpers/sessionChecker"
import chatChecker from "../../helpers/chatChecker"
import { connectSlave } from "../../connector/connectSlave"

interface requestType {
    userSession : string
    chatSession : string
    prompt : string
}

interface last_5_chats_type {
    id : number;
    chatid : number;
    ques : string;
    ans : string;
    q_time : Date;
    workflow : string;
}

async function chatRequirements(req : Request & {body : requestType} , res : Response) {
    const userSession = req.body.userSession
    const chatSession = req.body.chatSession
    const prompt = req.body.prompt
    const connectionSlave = await connectSlave();
    const isValidSession = await sessionChecker(userSession as string)
    if(isValidSession?.status=="error"){
        res.status(200).json({
            status : "error",
            message : "invalid session",
            data : ""
        })
        return
    }
    const isValidChat = await chatChecker(isValidSession?.uname as string , chatSession as string);
    if(isValidChat.status == "error"){
        res.status(200).json({
            status : "error",
            message : isValidChat.message,
            data :""
        })
        return
    }
    const [last_5_chats] = await connectionSlave.execute(`
            SELECT c.id,
            c.chatid,
            c.ques,
            c.ans,
            c.q_time,
            w.workflow_text
            FROM chat c
            JOIN workflow w ON c.workflow_id = w.id
            WHERE c.chatid = ?
            ORDER BY c.q_time DESC
            LIMIT 5;
        `,[chatSession])

    const Last_5_Chats : last_5_chats_type[] = last_5_chats as last_5_chats_type[]

    const relevant_prompts = ""

    

    

    // history of the chat 5 q and a 
    // workflows of them 
    // relevant priompts + workflows 

}

export default chatRequirements