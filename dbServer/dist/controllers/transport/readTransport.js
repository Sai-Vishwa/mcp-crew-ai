import { connectMaster } from "../../connector/connectMaster.js";
import sessionChecker from "../../helpers/sessionChecker.js";
import toolAccessChecker from "../../helpers/toolAccessChecker.js";
async function readTransport(req, res) {
    try {
        const session = req.body.session;
        const validSessions = await sessionChecker(session);
        if (validSessions?.status === "error") {
            console.log("Invalid session detected in create placement");
            res.status(200).json({
                status: "error",
                message: "Invalid session"
            });
            return;
        }
        const validAccess = await toolAccessChecker({ session: session, toolName: "Read_Transport" });
        console.log("Access check result for create placement: ", validAccess);
        if (validAccess?.status === "error" || validAccess?.isAccessible === "NO") {
            res.status(200).json({
                status: "error",
                message: "Access denied"
            });
            return;
        }
        const connectionMaster = await connectMaster();
        const [transports] = await connectionMaster.query(`SELECT * FROM transport`, []);
        const transportEntries = transports;
        res.status(200).json({
            status: "success",
            message: "Placement data fetched successfully",
            data: transportEntries
        });
        return;
    }
    catch (err) {
        let message = "An error occurred during reading transport data";
        if (err instanceof Error) {
            message = err.message;
            console.error("Error in createPlacement function: ", message);
        }
        res.status(200).json({
            status: "error",
            message: message
        });
        return;
    }
}
export default readTransport;
