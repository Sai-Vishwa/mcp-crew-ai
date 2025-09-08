
import { Request , Response } from "express"
import sessionChecker from "../../helpers/sessionChecker"
import chatChecker from "../../helpers/chatChecker"
import { connectSlave } from "../../connector/connectSlave"
import readQdrant from "../../helpers/readQdrant"

interface requestType {
    userSession : string
    chatSession : string
    prompt : string
}



interface workflows {
    ques : string;
    ans : string;
    workflow : string;
    workflow_id : number;
}


interface top_matching_prompts {
    id : string;
    version : number;
    score : number;
    payload : {
        prompt : string
    }
}

async function matchingPrompts(req : Request & {body : requestType} , res : Response) {
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


    const relevant_prompts : top_matching_prompts[] = await readQdrant(prompt)

    let prompts : string[] = []

    relevant_prompts.map(prompt => {
        prompts.push(prompt.payload.prompt)
    })

    

    const [relevant_prompts_workflows] = await connectionSlave.execute(`
        SELECT w.workflow_id, w.workflow, c.ques, c.ans
        FROM chat c
        JOIN workflow w ON c.workflow_id = w.workflow_id
        WHERE c.ques IN (?)`,[prompts]
    )

    const Relevant_prompts_workflows : workflows[] = relevant_prompts_workflows as workflows[] 

    return {
        status : "success" ,
        message : "3 relevant prompts and their corresponding workflows are fetched",
        data : Relevant_prompts_workflows
    }

}

export default matchingPrompts