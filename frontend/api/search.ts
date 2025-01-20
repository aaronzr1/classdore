import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from 'redis';

const app = express();
const port = 3000;

app.use(express.json());

const allowedOrigin = process.env.NODE_ENV === 'production' ? 'https://classdore.vercel.app' : 'http://localhost:5173';

app.use(cors({
    origin: allowedOrigin,
}));

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PSW,
    socket: {
        host: 'redis-15815.c322.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 15815,
    },
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

interface RedisSearchResult {
    total: number;
    documents: Array<any>; // Adjust type of documents as needed
}

app.get('/api/search', async (req: Request, res: Response) => {
    let keywords = Array.isArray(req.query.keywords)
        ? req.query.keywords.join(' ').trim()
        : typeof req.query.keywords === 'string'
            ? req.query.keywords.trim()
            : '';

    let total = 0;
    let ret = {};

    const specialChars = /([@\-+~!{}()\[\]^"~*?:\\])/g;
    keywords = keywords.replace(specialChars, '\\$1');

    // todo: more robust search parameters
    // if (keywords.includes('"')) {
    //     // exact match
    //     query = `@description:"${keywords}"`;
    // } else if (keywords.includes('*')) {
    //     // wildcard
    //     query = `*${keywords}*`;
    // }

    let query = "*"; // default query (match all documents)
    if (keywords && keywords.trim().length > 1) {
        query = `*${keywords}*`;
    }

    try {
        const result: RedisSearchResult = await client.ft.search(
            'idx:course',
            query,
            {
                LIMIT: {
                    from: 0,
                    size: 300, // limit to 300 for now
                },
            }
        );
        total = result["total"];
        ret = result["documents"];
        res.json({ total, message: ret });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});