
import { Request , Response } from "express"
import sessionChecker from "../../helpers/sessionChecker"
import chatChecker from "../../helpers/chatChecker"

interface requestType {
    userSession : string
    chatSession : string
    prompt : string
}

async function chatRequirements(req : Request & {body : requestType} , res : Response) {
    const userSession = req.body.userSession
    const chatSession = req.body.chatSession
    const prompt = req.body.prompt
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
    // history of the chat 5 q and a 
    // workflows of them 
    // relevant priompts + workflows 

}

export default chatRequirements