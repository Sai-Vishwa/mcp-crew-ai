
import { Request , Response } from "express";
import { connectMaster } from "../../connector/connectMaster.js";
import generateSession from "../../helpers/sessionGenerator.js";
import sessionChecker from "../../helpers/sessionChecker.js";

interface requestType {
    session : string;
    company_name : string;
    visiting_date : Date;
    interview_start : string;
    interview_end : string;
}

interface responseType {
    status : string;
    message ?: string;
    error ?: string;
}

async function createPlacement(req : Request & {body : requestType}, res: Response) {
    try{
            const  session = req.body.session;
            const company_name = req.body.company_name;
            const visiting_date = req.body.visiting_date;
            const interview_start = req.body.interview_start;
            const interview_end = req.body.interview_end;

            const validSessions = await sessionChecker(session);

            if (validSessions?.status === "error"){
                res.status(200).json({
                    status: "error",
                    error: "Invalid session"
                });
                return;
            }


            const connectionMaster = await connectMaster();


            
            await connectionMaster.query(`INSERT INTO placement (company_name , visiting_date , interview_start , interview_end ) values (? , ? , ? , ? )`, [company_name , visiting_date , interview_start , interview_end ]);
            res.status(200).json({
                status: "success",
                message :"Placement entry created successfully"
            });
            return;
    }
    catch(err: any){
        console.error("Error in login function: ", err);
        res.status(200).json({
            status: "error",
            message: "An error occurred during login"
        });
        return;
    }
    
}

export default createPlacement;