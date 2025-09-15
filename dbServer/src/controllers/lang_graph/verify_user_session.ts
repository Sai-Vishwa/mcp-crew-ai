import { Request, Response } from "express";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import sessionChecker from "../../helpers/sessionChecker.js";
import chatChecker from "../../helpers/chatChecker.js";
import { connectMaster } from "../../connector/connectMaster.js";
import mysql from 'mysql2/promise.js'

interface requestType {
    user_session : string;
    chat_session : string;
    lang_graph_server_secret : string;
    ques : string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function verify_user_session(req : Request & {body : requestType}, res : Response) {
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
            
            const [chat] = await connectionMaster.query(
                `INSERT INTO chat (chatid , ques , ans , q_time , status) VALUES (?,?,?,?,?)`,
                [chat_session , ques , "" , new Date() , 'pending']
            )

            const user_input_id : number = (chat as mysql.ResultSetHeader).insertId;
            
            res.status(200).json({
                status: "success",
                message: "The user session is valid and the chat memory is loaded",
                user_input_id: user_input_id,
                user_name: isValidSession.uname
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

export default verify_user_session;