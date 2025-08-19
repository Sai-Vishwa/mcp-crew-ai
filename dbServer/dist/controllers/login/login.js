import { connectSlave } from "../../connector/connectSlave.js";
import { connectMaster } from "../../connector/connectMaster.js";
import generateSession from "../../helpers/sessionGenerator.js";
async function login(req, res) {
    try {
        const uname = req.body.username;
        const password = req.body.password;
        const connectionSlave = await connectSlave();
        const connectionMaster = await connectMaster();
        const [sysPassword] = await connectionSlave.query(`SELECT password FROM auth WHERE uname = ?`, [uname]);
        const sysPwd = sysPassword;
        console.log("System password fetched: ", sysPwd);
        if (sysPwd.length === 0) {
            res.status(200).json({
                status: "error",
                message: "Invalid login"
            });
            return;
        }
        if (sysPwd[0].password !== password) {
            res.status(200).json({
                status: "error",
                message: "Invalid login",
            });
            return;
        }
        const session = generateSession();
        await connectionMaster.query(`INSERT INTO session (session , uname) values (? , ?)`, [session, uname]);
        res.status(200).json({
            session: session,
            status: "success",
            message: "Login successful"
        });
        return;
    }
    catch (err) {
        console.error("Error in login function: ", err);
        res.status(200).json({
            status: "error",
            message: "An error occurred during login"
        });
        return;
    }
}
export default login;
