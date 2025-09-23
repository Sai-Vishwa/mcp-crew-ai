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

interface WorkflowStep {
  step_number: number;
  tool_name: string;
  tool_description: string;
}

interface Workflow {
  workflow_id: number;
  workflow_name: string;
  workflow_description: string;
  confidence_score: number;
  reasoning: string;
  workflow_steps: WorkflowStep[];
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

            console.log("The valid session in load relevant workflow is ==> " , isValidSession)

            console.log("ayayoooo" , isValidSession.uname)

            const UNAME = isValidSession.uname

            if(isValidSession.status == "error"){
                res.status(200).json({
                    status: "error",
                    message: "Invalid session"
                });
                return;
            }

            const isValidChat = await chatChecker(UNAME as string, chat_session)

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

            console.log("The top matching prompts are ==> " , JSON.stringify(top_matching_prompts))

            top_matching_prompts.data.map( (item) => {
                workflow_id_arr.push(item.payload.workflow_id as number)
            })

            const connectionSlave = await connectSlave();

            const [workflows] = await connectionSlave.query(
                `
                SELECT 
                    w.workflow_id,
                    w.workflow_name,
                    w.workflow_description,
                    w.confidence_score,
                    w.reasoning,
                    s.step_number,
                    s.tool_name,
                    s.tool_description
                FROM workflow w
                LEFT JOIN workflow_steps s ON w.workflow_id = s.workflow_id
                WHERE w.workflow_id IN (?)
                ORDER BY w.workflow_id, s.step_number;
                `,[workflow_id_arr]
            )


            const workflowMap = new Map<number, Workflow>();

            for (const row of workflows as any[]) {
                if (!workflowMap.has(row.workflow_id)) {
                    workflowMap.set(row.workflow_id, {
                        workflow_id: row.workflow_id,
                        workflow_name: row.workflow_name,
                        workflow_description: row.workflow_description,
                        confidence_score: row.confidence_score,
                        reasoning: row.reasoning,
                        workflow_steps: [],
                    });
                }

                if (row.step_number !== null) {
                    workflowMap.get(row.workflow_id)!.workflow_steps.push({
                        step_number: row.step_number,
                        tool_name: row.tool_name,
                        tool_description: row.tool_description,
                    });
                }
            }

            const result: (Workflow & { prompt: string })[] = [];
            for (const prompt of top_matching_prompts.data) {
                const wf = workflowMap.get(prompt.payload.workflow_id);
                if (wf) {
                result.push({
                    ...wf,
                    prompt: prompt.payload.prompt,
                });
                }
            }


            console.log("The result is ==> " , result)

            
            res.status(200).json({
                status : "success",
                message : "Relevant workflows fetched successfully",
                data : result
            })

            return 


    }
    catch (err : unknown) {
        console.log("db serever la tha error")
        console.log(err)
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