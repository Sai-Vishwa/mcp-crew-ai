import { connectSlave } from "../connector/connectSlave.js";
async function sessionChecker(session) {
    try {
        const connectionSlave = await connectSlave();
        const [username] = await connectionSlave.query(`SELECT uname FROM session WHERE session = ?`, [session]);
        const uname = username;
        if (uname.length !== 1) {
            return {
                status: "error",
                uname: ""
            };
        }
        return {
            status: "success",
            uname: uname[0].uname
        };
    }
    catch (err) {
        console.error("Error in login function: ", err);
        return {
            status: "error",
            uname: ""
        };
    }
}
export default sessionChecker;
