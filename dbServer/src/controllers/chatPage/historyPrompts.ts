import { Request, Response } from "express";
import { connectSlave } from "../../connector/connectSlave";
import sessionChecker from "../../helpers/sessionChecker";
import chatChecker from "../../helpers/chatChecker";

interface requestType {
    userSession : string
    chatSession : string
}

interface last_5_chats_type {
    id : number;
    chatid : number;
    ques : string;
    ans : string;
    q_time : Date;
    workflow_id : number;
    workflow : string;
}

async function historyPrompts(req : Request & {body : requestType}, res : Response) {
    const userSession = req.body.userSession
    const chatSession = req.body.chatSession
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
            w.workflow_id
            w.workflow_text
            FROM chat c
            JOIN workflow w ON c.workflow_id = w.workflow_id
            WHERE c.chatid = ?
            ORDER BY c.q_time DESC
            LIMIT 5;
        `,[chatSession])

    const Last_5_Chats : last_5_chats_type[] = last_5_chats as last_5_chats_type[]

    return {
        status : "success" , 
        message : "last 5 chats from history is fetched successfully" , 
        data : Last_5_Chats
    }
}

export default historyPrompts