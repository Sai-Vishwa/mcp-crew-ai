import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
let qdrantClient = null;
async function connectQdrant() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    dotenv.config({ path: resolve(__dirname, '.env') });
    if (!qdrantClient) {
        qdrantClient = await new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API,
            port: 443
        });
    }
    try {
        await qdrantClient.getCollection("MeowDass");
    }
    catch (err) {
        console.log("connect panna enna error uh ?????")
        console.log(err)
        await qdrantClient.createCollection("MeowDass", {
            vectors: {
                size: 768,
                distance: "Cosine"
            }
        });
    }
    return qdrantClient;
}
export default connectQdrant;
