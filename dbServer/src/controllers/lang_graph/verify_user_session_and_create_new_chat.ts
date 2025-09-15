import { Request, Response } from "express";
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise.js'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import sessionChecker from "../../helpers/sessionChecker.js";
import { connectMaster } from "../../connector/connectMaster.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

interface requestType {
    user_session : string;
    lang_graph_server_secret : string;
    ques : string
}


async function verify_user_session_and_create_new_chat(req : Request & {body : requestType}, res : Response) {
    
    try {
            const user_session = req.body.user_session;
            const lang_graph_server_secret = req.body.lang_graph_server_secret;
            console.log(req.body)
            const ques = req.body.ques


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
                    message: "Invalid session"
                });
                return;
            }

            const connectionMaster = await connectMaster();

            const [chathistory] = await connectionMaster.query(`INSERT INTO chathistory (uname , lastchatdate , chatName) values (? , ? , ?)`, [isValidUser.uname , new Date() , "New Chat"]);

            const chatId: number = (chathistory as mysql.ResultSetHeader).insertId;


            const [chat] = await connectionMaster.query(
                `INSERT INTO chat (chatid , ques , ans , q_time , status) VALUES (?,?,?,?,?)`,
                [chatId , ques , "" , new Date() , 'pending']
            )

            const qid : number = (chat as mysql.ResultSetHeader).insertId;

            res.status(200).json({
                status: "success",
                message: "Session verified and new chat created" , 
                uname: isValidUser.uname,
                chatid: chatId,
                user_input_id : qid
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