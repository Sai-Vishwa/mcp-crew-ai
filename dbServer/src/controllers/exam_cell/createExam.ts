
import { Request , Response } from "express";
import { connectMaster } from "../../connector/connectMaster.js";
import sessionChecker from "../../helpers/sessionChecker.js";
import toolAccessChecker from "../../helpers/toolAccessChecker.js";

interface requestType {
    session : string;
    exam_name : string;    
    exam_date : string;
    exam_start : string;
    exam_end : string;
}


async function createExam(req : Request & {body : requestType}, res: Response) {
    try{
            const  session = req.body.session;
            const exam_date = req.body.exam_date;
            const exam_start = req.body.exam_start;
            const exam_end = req.body.exam_end;
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

            const validAccess = await toolAccessChecker({session: session, toolName: "Create_ExamCell"});

            console.log("Access check result for create placement: ", validAccess);

            if(validAccess?.status === "error" || validAccess?.isAccessible === "NO"){
                console.log("Access denied for create placement");
                res.status(200).json({
                    status: "error",
                    message: "Access denied"
                });
                return;
            }

            const connectionMaster = await connectMaster();

            await connectionMaster.query(
  `INSERT INTO examcell (exam_name, exam_date, exam_start, exam_end)
   VALUES (?, ?, ? , ?)
   ON DUPLICATE KEY UPDATE 
      exam_date = VALUES(exam_date),
      exam_start = VALUES(exam_start),
      exam_end = VALUES(exam_end)`,
  [exam_name, exam_date, exam_start, exam_end]
);

            console.log("Placement entry created successfully");
            res.status(200).json({
                status: "success",
                message :"Placement entry created successfully"
            });
            return;
    }
    catch(err: unknown){
        let message = "An error occurred during placement creation";
        if (err instanceof Error) {
            message = err.message;
            console.error("Error in createExam function: ", message);
        }
        console.error("Error in login function: ", err);
        res.status(200).json({
            status: "error",
            message: message
        });
        return;
    }
    
}

export default createExam;