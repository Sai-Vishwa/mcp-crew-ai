
import { Request , Response } from "express";
import { connectSlave } from "../../connector/connectSlave.js";
import generateSession from "../../helpers/sessionGenerator.js";
import sessionChecker from "../../helpers/sessionChecker.js";

interface requestType {
    session: string;
}

interface chatHistoryType {
    id: number;
    uname: string;
    lastchatdate: Date;
    chatName: string; 
}

interface toolType {
    id: number;
    name: string;
    description: string;
    access_status: string;
}

async function botPage(req : Request & {body : requestType}, res: Response) {
    try{
            const  session = req.body.session;

            const connectionSlave = await connectSlave();

            const isValidSession = await sessionChecker(session as string);

            if(isValidSession?.status === "error"){
                res.status(200).json({
                    status: "error",
                    message: "Invalid session"
                });
                return;
            }

            const [toolsAvailable] = await connectionSlave.query(`
                        SELECT 
                            t.id,
                            t.name,
                            t.description,
                            CASE 
                                WHEN a.tool_id IS NOT NULL OR sa.tool_id IS NOT NULL THEN 'Available'
                                ELSE 'Unavailable'
                            END AS access_status
                        FROM tools t
                        LEFT JOIN auth u ON u.uname = ?
                        LEFT JOIN access a 
                            ON a.tool_id = t.id AND a.user_type = u.role
                        LEFT JOIN specialaccess sa 
                            ON sa.tool_id = t.id AND sa.uname = u.uname;
            `,[isValidSession?.uname]);

            const tools: toolType[] = toolsAvailable as toolType[];

            const [chatHistory] = await connectionSlave.query(`
                SELECT * FROM chathistory WHERE uname = ?`, [isValidSession?.uname]);

            const chat: chatHistoryType[] = chatHistory as chatHistoryType[];

            res.status(200).json({
                status: "success",
                message :"Login successful",
                data: {
                    tools: tools,
                    chatHistory: chat
                }
            });
            return;
    }
    catch(err: any){
        console.error("Error in login function: ", err);
        res.status(200).json({
            status: "error",
            message: "An error occurred during login",
            data : {
                tools : [],
                chatHistory: []
            }
        });
        return;
    }
    
}

export default botPage;