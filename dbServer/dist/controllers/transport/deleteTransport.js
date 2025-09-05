import { connectMaster } from "../../connector/connectMaster.js";
import sessionChecker from "../../helpers/sessionChecker.js";
import toolAccessChecker from "../../helpers/toolAccessChecker.js";
async function deleteTransport(req, res) {
    try {
        const session = req.body.session;
        const bus_date = req.body.bus_date;
        const validSessions = await sessionChecker(session);
        if (validSessions?.status === "error") {
            console.log("Invalid session detected in create placement");
            res.status(200).json({
                status: "error",
                message: "Invalid session"
            });
            return;
        }
        const validAccess = await toolAccessChecker({ session: session, toolName: "Delete_Transport" });
        console.log("Access check result for create placement: ", validAccess);
        if (validAccess?.status === "error" || validAccess?.isAccessible === "NO") {
            res.status(200).json({
                status: "error",
                message: "Access denied"
            });
            return;
        }
        const connectionMaster = await connectMaster();
        await connectionMaster.query(`DELETE FROM transport where bus_date = ?`, [bus_date]);
        res.status(200).json({
            status: "success",
            message: "trabnsport entry deleted successfully"
        });
        return;
    }
    catch (err) {
        let message = "An error occurred during transport entry deletion";
        if (err instanceof Error) {
            message = err.message;
            console.error("Error in deletePlacement function: ", message);
        }
        res.status(200).json({
            status: "error",
            message: message
        });
        return;
    }
}
export default deleteTransport;
