import express from 'express';
import { indexCourses, searchCourses } from '../services/redis-service';

import fs from 'fs';
import { Course, RawCourse } from '@/../../shared/course';

const router = express.Router();

router.get('/index-data', async (req, res) => {

    try {
        const rawData = fs.readFileSync('../data/data.json', 'utf-8');
        const rawCourses: RawCourse[] = JSON.parse(rawData);
        const courses: Course[] = rawCourses.map((course) => ({
            ...course,
            capacity: parseInt(course.capacity),
            enrolled: parseInt(course.enrolled),
            wl_capacity: parseInt(course.wl_capacity),
            wl_occupied: parseInt(course.wl_occupied),
            term_year: parseInt(course.term_year),
        }));

        // console.log('Value:', courses[0].capacity);
        // console.log('Type:', typeof courses[0].capacity);

        console.time('indexCourses');
        await indexCourses(courses);
        console.timeEnd('indexCourses');

        res.json({ message: 'Indexing complete' })
    } catch (error) {
        console.error('Error caching:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all courses
router.get('/courses', async (req, res) => {
    try {

        const courses = await searchCourses("*"); // grab all data
        
        if (courses) {
            res.json(courses);
        } else {
            console.log("No courses indexed");
            res.status(500).json({ error: 'Internal server error (no courses indexed)' });
        }

    } catch (error) {
        console.error('Error fetching all courses:', error);
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

        // TODO: can add error logic here (handle bad queries ex. @@a* differently)
        if (!courses) {
            console.log('Bad query, just returning empty')
            return res.json(null)
        }
        
        res.json(courses);

    } catch (error) {
        console.error('Error searching this query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;