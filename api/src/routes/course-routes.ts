import express from 'express';
import { getAllCourses, searchCourses } from '../services/course-service';
import { indexCourses } from '../services/redis-service';

import fs from 'fs';
import { Course } from '../types/course';

const router = express.Router();

// Get all courses
router.get('/courses', async (req, res) => {
    try {

        const courses = await getAllCourses();
        res.json(courses);

    } catch (error) {
        console.error('Error fetching all courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/caching', async (req, res) => {

    try {
        const rawData = fs.readFileSync('../data/data.json', 'utf-8');
        const json = JSON.parse(rawData);
        const courses: Course[] = json as Course[];
        res.json("yay");
        indexCourses(courses);
    } catch (error) {
        console.error('Error caching:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search courses
router.get('/courses/search', async (req, res) => {
    try {

        const query = req.query.keywords as string;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const courses = await searchCourses(query);
        res.json(courses);

    } catch (error) {
        console.error('Error searching this query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router; 