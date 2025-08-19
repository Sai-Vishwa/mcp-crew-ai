import { randomBytes } from "crypto";

const generateSession = (): string => {
  return randomBytes(32).toString("hex"); 
};

export default generateSession;
