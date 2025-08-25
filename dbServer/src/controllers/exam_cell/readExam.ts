
import { Request , Response } from "express";
import { connectMaster } from "../../connector/connectMaster.js";
import sessionChecker from "../../helpers/sessionChecker.js";
import toolAccessChecker from "../../helpers/toolAccessChecker.js";

interface requestType {
    session : string;
}

interface examType {
    id: number;
    exam_name: string;
    exam_date: string;
    exam_start: string;
    exam_end: string;
}


async function readExam(req : Request & {body : requestType}, res: Response) {
    try{
            const  session = req.body.session;

            const validSessions = await sessionChecker(session);


            if (validSessions?.status === "error"){

                res.status(200).json({
                    status: "error",
                    message: "Invalid session"
                });
                return;
            }

            const validAccess = await toolAccessChecker({session: session, toolName: "Read_Exam"});

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

            const [exams] = await connectionMaster.query(`SELECT * FROM examcell`,[]);

            const examEntries: examType[] = exams as examType[];

            

            res.status(200).json({
                status: "success",
                message :"Placement data fetched successfully",
                data: examEntries
            });
            return;
    }
    catch(err: unknown){
        let message = "An error occurred during reading exam data";
        if (err instanceof Error) {
            message = err.message;
            console.error("Error in createExam function: ", message);
        }
        res.status(200).json({
            status: "error",
            message: message
        });
        return;
    }
    
}

export default readExam;