
import { Request , Response } from "express";
import { connectMaster } from "../../connector/connectMaster.js";
import sessionChecker from "../../helpers/sessionChecker.js";
import toolAccessChecker from "../../helpers/toolAccessChecker.js";

interface requestType {
    session : string;
    bus_date : string;
    start_time : string;
    leave_time : string; 
}


async function createTransport(req : Request & {body : requestType}, res: Response) {
    try{
            const  session = req.body.session;
            const bus_date = req.body.bus_date;
            const start_time = req.body.start_time;
            const leave_time = req.body.leave_time;

            const validSessions = await sessionChecker(session);


            if (validSessions?.status === "error"){

                console.log("Invalid session detected in create placement");
                res.status(200).json({
                    status: "error",
                    message: "Invalid session"
                });
                return;
            }

            const validAccess = await toolAccessChecker({session: session, toolName: "Create_Transport"});


            if(validAccess?.status === "error" || validAccess?.isAccessible === "NO"){
                res.status(200).json({
                    status: "error",
                    message: "Access denied"
                });
                return;
            }

            const connectionMaster = await connectMaster();

            await connectionMaster.query(
  `INSERT INTO transport (bus_date , start_time , leave_time)
   VALUES (?, ?, ?)
   ON DUPLICATE KEY UPDATE 
      start_time = VALUES(start_time),
      leave_time = VALUES(leave_time),`,
  [bus_date , start_time , leave_time]
);
            res.status(200).json({
                status: "success",
                message :"Transport entry created successfully"
            });
            return;
    }
    catch(err: unknown){
            let message = "An error occurred during transport creation";
            if (err instanceof Error) {
                message = err.message;
                console.error("Error in createPlacement function: ", message);
            }
        res.status(200).json({
            status: "error",
            message: message
        });
        return;
    }
    
}

export default createTransport;