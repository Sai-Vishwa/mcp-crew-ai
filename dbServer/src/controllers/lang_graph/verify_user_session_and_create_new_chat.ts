import { Request, Response } from "express";
import path from 'path';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import sessionChecker from "../../helpers/sessionChecker";
import { connectMaster } from "../../connector/connectMaster";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();


interface requestType {
    user_Session : string;
    lang_graph_server_secret : string;
}


async function verify_user_session_and_create_new_chat(req : Request & {body : requestType}, res : Response) {
    
    try {
            const user_session = req.body.user_Session;
            const lang_graph_server_secret = req.body.lang_graph_server_secret;

            if(lang_graph_server_secret !== process.env.MASTER_PASSWORD){
                res.status(200).json({
                    status: "error",
                    message: "Unauthorized access"
                });
                return;
            }

            const isValidUser = await sessionChecker(user_session)

            if(isValidUser.status == "error"){
                res.status(200).json({
                    status: "error",
                    message: "Unauthorized access"
                });
                return;
            }

            const connectionMaster = await connectMaster();

            await connectionMaster.query(`INSERT INTO chat_history (uname , lastchatdate , chatName) values (?)`, [isValidUser.uname , new Date() , "New Chat"]);

            res.status(200).json({
                status: "success",
                message: "Session verified and new chat created" , 
                uname: isValidUser.uname,
            });
            return;
    }

    catch(err: unknown){
        let message = "An error occurred during session verification";
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

export default verify_user_session_and_create_new_chat;