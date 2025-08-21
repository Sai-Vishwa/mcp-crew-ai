import { connectSlave } from "../../connector/connectSlave.js";
import sessionChecker from "../../helpers/sessionChecker.js";
async function chatPage(req, res) {
    try {
        const session = req.body.session;
        const connectionSlave = await connectSlave();
        const isValidSession = await sessionChecker(session);
        if (isValidSession?.status === "error") {
            res.status(200).json({
                status: "error",
                message: "Invalid session"
            });
            return;
        }
        const [toolsAvailable] = await connectionSlave.query(`
                            SELECT 
                                t.id,
                                t.name,
                                t.description,
                                CASE 
                                    WHEN a.tool_id IS NOT NULL OR sa.tool_id IS NOT NULL THEN TRUE
                                    ELSE FALSE
                                END AS available
                            FROM tools t
                            LEFT JOIN auth u ON u.uname = ?
                            LEFT JOIN access a 
                                ON a.tool_id = t.id AND a.user_type = u.role
                            LEFT JOIN specialaccess sa 
                                ON sa.tool_id = t.id AND sa.uname = u.uname;
            `, [isValidSession?.uname]);
        const tools = toolsAvailable;
        const [chatHistory] = await connectionSlave.query(`
                SELECT * FROM chathistory WHERE uname = ?`, [isValidSession?.uname]);
        const chat = chatHistory;
        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                tools: tools,
                chatHistory: chat
            }
        });
        return;
    }
    catch (err) {
        console.error("Error in login function: ", err);
        res.status(200).json({
            status: "error",
            message: "An error occurred during login",
            data: {
                tools: [],
                chatHistory: []
            }
        });
        return;
    }
}
export default chatPage;
