import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from './course.model';
import { createClient } from 'redis';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',  // Allow only your frontend's URL
}));

app.get('/api', (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

app.get('/', (req, res) => {
    res.send('ClassDore API');
});

const port = process.env.PORT || 3000;

mongoose
    .connect(process.env.MONGO_URI || '')
    .then(() => {
        console.error('Connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
    });

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

    // TODO: allow for "" for exactness, and * for pre/suff/fix (override %)

    let query = "*"; // default query (match all documents)
    if (keywords && keywords.trim().length > 1) {
        query = `*${keywords}*`;
    }


    // parse each part of query, don't forget to trim()
    const result = await client.ft.search(
        'idx:course',
        // '@description:accessible @course_dept:DS',
        query,
        {
            LIMIT: {
                from: 0,
                size: 300,
                // size: 10000,
            },
        }
    );
    total = result["total"];
    ret = result["documents"];

    res.json({ total: total, message: ret });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// // using Mongo
// app.get('/courses', async (req, res) => {
//     try {
//         const courses = await Course.find();  // Retrieve data from MongoDB Atlas
//         res.json(courses);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching courses' });
//     }
// });
