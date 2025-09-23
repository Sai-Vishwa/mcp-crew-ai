import { connectSlave } from "../connector/connectSlave.js";
async function sessionChecker(session) {
    try {
        console.log("INGA PAARU = ", session);
        const connectionSlave = await connectSlave();
        const [username] = await connectionSlave.query(`SELECT uname FROM session WHERE session = ?`, [session]);
        const uname = username;
        if (uname.length !== 1) {
            return {
                status: "error",
                uname: "error"
            };
        }
        if (typeof uname[0].uname != "string") {
            return {
                status: "error",
                uname: "error"
            };
        }
        const USER = uname[0].uname;
        return {
            status: "success",
            uname: USER
        };
    }
    catch (err) {
        console.error("Error in login function: ", err);
        return {
            status: "error",
            uname: "error"
        };
    }
}
export default sessionChecker;
