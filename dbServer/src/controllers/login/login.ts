
import { Request , Response } from "express";
import { connectSlave } from "../../connector/connectSlave.js";
import { connectMaster } from "../../connector/connectMaster.js";
import { stat } from "fs";
import generateSession from "../../helpers/sessionGenerator.js";

interface requestType {
    uname : string;
    password : string;
}

interface passwordType {
    password : string;
}

async function login(req : Request & {body : requestType}, res: Response) {
    try{
            const  uname = req.body.uname;
            const password = req.body.password;
            const connectionSlave = await connectSlave();
            const connectionMaster = await connectMaster();
            const [sysPassword] = await connectionSlave.query(`SELECT password FROM auth WHERE uname = ?`, [uname]);
            const sysPwd : passwordType[] = sysPassword as passwordType[];
            if(sysPwd.length === 0){
                res.status(200).json({
                    status: "error",
                    message: "Invalid login"
                })
                return
            }
            if(sysPwd[0].password !==  password){
                res.status(200).json({
                    status: "error",
                    message: "Invalid login",
                })
                return
            }
            const session : string = generateSession();
            await connectionMaster.query(`INSERT INTO session (session , uname) values (? , ?)`, [session , uname]);
            res.status(200).json({
                session: session,
                status: "success",
                message :"Login successful"
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

export default login;