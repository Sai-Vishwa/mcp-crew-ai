import { connectSlave } from "../connector/connectSlave.js";

interface unameType {
    uname: string;
}

interface responseType {
    status: string;
    uname: string;
}

async function sessionChecker(session : string) : Promise<responseType> {
    try{

            console.log("INGA PAARU = " ,session)
            const connectionSlave = await connectSlave();
            const [username] = await connectionSlave.query(`SELECT uname FROM session WHERE session = ?`, [session]);
            const uname : unameType[] = username as unameType[];
            if(uname.length !== 1){
                return {
                    status: "error",
                    uname: ""
                } as responseType;
            }
            return {
                status: "success",
                uname: uname[0].uname
            } as responseType;
    }
    catch(err: any){
        console.error("Error in login function: ", err);
        return {
            status: "error",
            uname: ""
        } as responseType;
    }
    
}

export default sessionChecker;