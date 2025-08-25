
import { Request , Response } from "express";
import { connectMaster } from "../../connector/connectMaster.js";
import sessionChecker from "../../helpers/sessionChecker.js";
import toolAccessChecker from "../../helpers/toolAccessChecker.js";

interface requestType {
    session : string;
    exam_name : string;
}


async function deleteExam(req : Request & {body : requestType}, res: Response) {
    try{
            const  session = req.body.session;
            const exam_name = req.body.exam_name;

            const validSessions = await sessionChecker(session);


            if (validSessions?.status === "error"){

                console.log("Invalid session detected in create placement");
                res.status(200).json({
                    status: "error",
                    message: "Invalid session"
                });
                return;
            }

            const validAccess = await toolAccessChecker({session: session, toolName: "Delete_ExamCell"});

            console.log("Access check result for create placement: ", validAccess);

            if(validAccess?.status === "error" || validAccess?.isAccessible === "NO"){
                res.status(200).json({
                    status: "error",
                    message: "Access denied"
                });
                return;
            }

            const connectionMaster = await connectMaster();

            await connectionMaster.query( `DELETE FROM examcell where exam_name = ?`,[exam_name]);

            

            console.log("Placement entry created successfully");
            res.status(200).json({
                status: "success",
                message :"exam entry deleted successfully"
            });
            return;
    }
    catch(err: unknown){

        let message = "An error occurred during entry deletion";
        if (err instanceof Error) {
            message = err.message;
            console.error("Error in deletePlacement function: ", message);
        }
        res.status(200).json({
            status: "error",
            message: message
        });
        return;
    }
    
}

export default deleteExam;