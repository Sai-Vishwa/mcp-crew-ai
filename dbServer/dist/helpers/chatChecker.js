import { connectSlave } from "../connector/connectSlave.js";
async function chatChecker(userName, chatSession) {
    try {
        const connectionSlave = await connectSlave();
        const [resp] = await connectionSlave.execute("select uname from chathistory where chatid=?", [chatSession]);
        const Response = resp;
        if (Response[0].uname === userName) {
            return {
                status: "success",
            };
        }
        return {
            status: "error",
            message: "The chatsession does not belong to the user"
        };
    }
    catch (err) {
        return {
            status: "error",
            message: "internal error"
        };
    }
}
export default chatChecker;
