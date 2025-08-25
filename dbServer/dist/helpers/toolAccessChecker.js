import { connectSlave } from "../connector/connectSlave.js";
async function toolAccessChecker(input) {
    try {
        const connectionSlave = await connectSlave();
        const [resp] = await connectionSlave.query(`
                SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1
            FROM session s
            JOIN auth a ON s.uname = a.uname
            JOIN tools t ON t.name = ?
            LEFT JOIN access ra ON ra.user_type = a.role AND ra.tool_id = t.id
            LEFT JOIN specialaccess sa ON sa.uname = a.uname AND sa.tool_id = t.id
            WHERE s.session = ?
              AND (ra.tool_id IS NOT NULL OR sa.tool_id IS NOT NULL)
        )
        THEN 'YES'
        ELSE 'NO'
    END AS access_result;`, [input.toolName, input.session]);
        const response = resp;
        return {
            status: "success",
            isAccessible: response[0].access_result
        };
    }
    catch (err) {
        console.error("Error in login function: ", err);
        return {
            status: "error",
            isAccessible: "NO"
        };
    }
}
export default toolAccessChecker;
