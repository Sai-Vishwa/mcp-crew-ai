import { connectMaster } from "../../connector/connectMaster.js";
import sessionChecker from "../../helpers/sessionChecker.js";
import toolAccessChecker from "../../helpers/toolAccessChecker.js";
async function readPlacement(req, res) {
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
        const validAccess = await toolAccessChecker({ session: session, toolName: "Read_Placement" });
        console.log("Access check result for create placement: ", validAccess);
        if (validAccess?.status === "error" || validAccess?.isAccessible === "NO") {
            console.log("Access denied for create placement");
            res.status(200).json({
                status: "error",
                message: "Access denied"
            });
            return;
        }
        const connectionMaster = await connectMaster();
        const [placements] = await connectionMaster.query(`SELECT * FROM placement`, []);
        const placementEntries = placements;
        res.status(200).json({
            status: "success",
            message: "Placement data fetched successfully",
            data: placementEntries
        });
        return;
    }
    catch (err) {
        let message = "An error occurred during reading placement data";
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
export default readPlacement;
