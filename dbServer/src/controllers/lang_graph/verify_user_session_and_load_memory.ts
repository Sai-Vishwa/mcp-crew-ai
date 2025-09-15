import { Request, Response } from "express";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import sessionChecker from "../../helpers/sessionChecker.js";
import chatChecker from "../../helpers/chatChecker.js";
import { connectMaster } from "../../connector/connectMaster.js";
import mysql from 'mysql2/promise.js'
import { connectSlave } from "../../connector/connectSlave.js";

interface requestType {
    user_session : string;
    chat_session : string;
    lang_graph_server_secret : string;
    ques : string;
}


interface last_5_chats_type {
    id : number;
    chatid : number;
    ques : string;
    ans : string;
    q_time : Date;
    workflow_id : number;
    workflow : string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function verify_user_session_and_load_memory(req : Request & {body : requestType}, res : Response) {
    try {
            const user_session = req.body.user_session;
            const lang_graph_server_secret = req.body.lang_graph_server_secret;
            const ques = req.body.ques;
            const chat_session = parseInt(req.body.chat_session);

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

            const connectionMaster = await connectMaster();
            const connectionSlave = await connectSlave();
            
            const [chat] = await connectionMaster.query(
                `INSERT INTO chat (chatid , ques , ans , q_time , status) VALUES (?,?,?,?,?)`,
                [chat_session , ques , "" , new Date() , 'pending']
            )

            const user_input_id : number = (chat as mysql.ResultSetHeader).insertId;

            const [last_5_chats] = await connectionSlave.execute(`
            SELECT c.id,
            c.chatid,
            c.ques,
            c.ans,
            c.q_time,
            w.workflow_id,
            w.workflow
            FROM chat c
            JOIN workflow w ON c.workflow_id = w.workflow_id
            WHERE c.chatid = ?
            AND c.workflow_id IS NOT NULL
            ORDER BY c.q_time DESC
            LIMIT 5;
        `,[chat_session])

            const Last_5_Chats : last_5_chats_type[] = last_5_chats as last_5_chats_type[]

            
            res.status(200).json({
                status: "success",
                message: "The user session is valid and the chat memory is loaded",
                user_input_id: user_input_id,
                user_name: isValidSession.uname,
                data: Last_5_Chats
            });
            return;
    }

    catch(err: unknown){
        let message = "An error occurred during session verification and memory loading";
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

export default verify_user_session_and_load_memory