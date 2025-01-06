import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from './course.model';
import { createClient } from 'redis';

dotenv.config();

const app = express();
app.use(express.json());

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

app.get('/courses', async (req, res) => {
  try {
    // Get all course keys from Redis
    const keys = await client.keys('*'); // Use '*' to get all keys

    if (keys.length === 0) {
      res.status(404).json({ message: 'No courses found' });
      return;
    }

    // Fetch all courses from Redis
    const courses = await Promise.all(
      keys.map(async (key) => {
        const courseData = await client.get(key); // Get course data by key
        if (courseData === null) {
          return null;
        }
        return JSON.parse(courseData); // Parse the stored JSON data
      })
    );

    // Send the courses as a JSON response
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error retrieving courses from Redis:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// // using Redis
// import Redis from 'ioredis';

// const redis = new Redis();
// redis.on('error', (err) => {
//     console.error('Redis error:', err);
// });

// // Route to get all courses from Redis
// app.get('/courses', async (req: Request, res: Response): Promise<void> => {
//     try {
//         // Get all course keys from Redis
//         const keys = await redis.keys('*'); // Use '*' to get all keys

//         if (keys.length === 0) {
//             res.status(404).json({ message: 'No courses found' });
//             return;
//         }

//         // Fetch all courses from Redis
//         const courses = await Promise.all(
//             keys.map(async (key) => {
//                 const courseData = await redis.get(key); // Get course data by key
//                 if (courseData === null) {
//                     return null;
//                 }
//                 return JSON.parse(courseData); // Parse the stored JSON data
//             })
//         );

//         // Send the courses as a JSON response
//         res.status(200).json(courses);

//     } catch (error) {
//         console.error('Error retrieving courses from Redis:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // using Mongo
// app.get('/courses', async (req, res) => {
//     try {
//         const courses = await Course.find();  // Retrieve data from MongoDB Atlas
//         res.json(courses);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching courses' });
//     }
// });
