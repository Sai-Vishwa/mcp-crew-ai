import { connectMaster } from "../../connector/connectMaster.js";
import sessionChecker from "../../helpers/sessionChecker.js";
import toolAccessChecker from "../../helpers/toolAccessChecker.js";
async function createPlacement(req, res) {
    try {
        const session = req.body.session;
        const company_name = req.body.company_name;
        const visiting_date = req.body.visiting_date;
        const interview_start = req.body.interview_start;
        const interview_end = req.body.interview_end;
        const validSessions = await sessionChecker(session);
        if (validSessions?.status === "error") {
            console.log("Invalid session detected in create placement");
            res.status(200).json({
                status: "error",
                message: "Invalid session"
            });
            return;
        }
        const validAccess = await toolAccessChecker({ session: session, toolName: "Create_Placement" });
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
        await connectionMaster.query(`INSERT INTO placement (company_name , visiting_date , interview_start , interview_end ) values (? , ? , ? , ? )`, [company_name, visiting_date, interview_start, interview_end]);
        console.log("Placement entry created successfully");
        res.status(200).json({
            status: "success",
            message: "Placement entry created successfully"
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
export default createPlacement;
