import { Request, Response } from "express";
import sessionChecker from "../../helpers/sessionChecker.js";
import chatChecker from "../../helpers/chatChecker.js";
import insertQdrant from "../../helpers/insertQdrant.js";
import readQdrant from "../../helpers/readQdrant.js";
import { connectSlave } from "../../connector/connectSlave.js";

interface requestType{
    user_session : string;
    chat_session : number;
    ques : string;
    lang_graph_server_secret : string;
}

interface top_matching_prompts {
    id : string;
    version : number;
    score : number;
    payload : {
        prompt : string , 
        workflow_id : number , 
    }
}

interface workflow_type {
    workflow_id : number;
    workflow : string;
}

interface responseType {
    prompt : string;
    workflow_id : number;
    workflow : string;
}

async function load_relevant_workflow(req : Request & {body : requestType} , res : Response) {
    try {
            const user_session = req.body.user_session;
            const chat_session = req.body.chat_session;
            const ques = req.body.ques;
            const lang_graph_server_secret = req.body.lang_graph_server_secret;

            if(lang_graph_server_secret !== process.env.MASTER_PASSWORD){
                res.status(200).json({
                    status: "error",
                    message: "Unauthorized access"
                });
                return;
            }

            const isValidSession = await sessionChecker(user_session)

            if(isValidSession.status == "error"){
                res.status(200).json({
                    status: "error",
                    message: "Invalid session"
                });
                return;
            }

            const isValidChat = await chatChecker(isValidSession.uname as string , chat_session)

            if(isValidChat.status == "error"){
                res.status(200).json({
                    status: "error",
                    message: isValidChat.message
                });
                return;
            }

            const top_matching_prompts = await readQdrant(ques)

            if(top_matching_prompts.status == "error"){
                res.status(200).json({
                    status: "error",
                    message: "An error occurred during fetching relevant workflows"
                });
                return;
            }

            let workflow_id_arr : number[] = []

            top_matching_prompts.data.forEach( (item) => {
                workflow_id_arr.push(item.payload.workflow_id as number)
            })

            const connectionSlave = await connectSlave();

            const [workflows] = await connectionSlave.query(
                `SELECT * FROM workflow WHERE workflow_id IN (?)`, [workflow_id_arr]
            )

            const Workflows : workflow_type[] = workflows as workflow_type[]


            let response_data : responseType[] = []

            top_matching_prompts.data.forEach( (item , index) => {
                let workflow_text = ""
                Workflows.forEach( (workflow) => {
                    if(workflow.workflow_id == item.payload.workflow_id){
                        workflow_text = workflow.workflow
                    }
                })
                response_data.push({
                    prompt : item.payload.prompt as string,
                    workflow_id : item.payload.workflow_id as number,
                    workflow : workflow_text
                })

            })
            return {
                status : "success",
                message : "Relevant workflows fetched successfully",
                data : response_data
            }


    }
    catch (err : unknown) {
        let message = "An error occurred during fetching relevant workflows";
        if (err instanceof Error) {
            message = err.message;
        }
        res.status(200).json({
            status: "error",
            message: message
        });
        return;
    }
}

export default load_relevant_workflow