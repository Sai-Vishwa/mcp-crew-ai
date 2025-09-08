import { QdrantClient } from "@qdrant/js-client-rest";

import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log(process.env.QDRANT_API)
async function main() {
    const qdrantClient = new QdrantClient({
    url : process.env.QDRANT_URL,
    apiKey : process.env.QDRANT_API,
    port : 443
    })

    console.log(await qdrantClient.getCollections())
}

main()
