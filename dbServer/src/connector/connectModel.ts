import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

console.log("Hey inga paaru ==> " , process.env.GEMINI_API)

export function getEmbeddingModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API!);
  return genAI.getGenerativeModel({ model: "models/embedding-001" });
}
