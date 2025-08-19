import { randomBytes } from "crypto";
const generateSession = () => {
    return randomBytes(32).toString("hex");
};
export default generateSession;
