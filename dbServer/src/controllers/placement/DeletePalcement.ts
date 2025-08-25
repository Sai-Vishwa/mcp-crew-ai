
import { Request , Response } from "express";
import { connectMaster } from "../../connector/connectMaster.js";
import generateSession from "../../helpers/sessionGenerator.js";
import sessionChecker from "../../helpers/sessionChecker.js";
import toolAccessChecker from "../../helpers/toolAccessChecker.js";

interface requestType {
    session : string;
    company_name : string;
}


async function deletePlacement(req : Request & {body : requestType}, res: Response) {
    try{
            const  session = req.body.session;
            const company_name = req.body.company_name;

            const validSessions = await sessionChecker(session);


            if (validSessions?.status === "error"){

                console.log("Invalid session detected in create placement");
                res.status(200).json({
                    status: "error",
                    message: "Invalid session"
                });
                return;
            }

            const validAccess = await toolAccessChecker({session: session, toolName: "Delete_Placement"});

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

            await connectionMaster.query( `DELETE FROM placement where company_name = ?`,[company_name]);

            

            console.log("Placement entry created successfully");
            res.status(200).json({
                status: "success",
                message :"Placement entry deleted successfully"
            });
            return;
    }
    catch(err: any){
        console.error("Error in login function: ", err);
        res.status(200).json({
            status: "error",
            message: "An error occurred during entry deletion"
        });
        return;
    }
    
}

export default deletePlacement;