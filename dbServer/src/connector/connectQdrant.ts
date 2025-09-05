import {QdrantClient} from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env .QDRANT_API,
});

export default client