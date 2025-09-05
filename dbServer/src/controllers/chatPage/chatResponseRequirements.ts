
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
            message : "invalid session"
        })
    }
    const isValidChat = await chatChecker(isValidSession?.uname as string , chatSession as string);
}

export default chatRequirements