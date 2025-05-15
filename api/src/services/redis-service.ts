import { createClient, SchemaFieldTypes } from 'redis';
import { Course, RedisSearchResult } from '../types/course';
import dotenv from 'dotenv';

dotenv.config();

// setup
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.on('error', (err: Error) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Connect to Redis when the module is imported
(async () => {
    try {
        await redisClient.connect();
        console.log('Redis connection established');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();

// Cache course data
// export async function indexCourses(courses: Course[]): Promise<void> {
//     try {
//         await redisClient.set('courses', JSON.stringify(courses));
//         console.log('Courses cached successfully');
//     } catch (error) {
//         console.error('Error caching courses:', error);
//     }
// }

export async function indexCourses(courses: Course[]): Promise<void> {

    // Try to create the index
    try {
        await redisClient.ft.create('idx:courses',
            {
                '$.id': { type: SchemaFieldTypes.TEXT, AS: 'id' },
                '$.course_dept': { type: SchemaFieldTypes.TEXT, WEIGHT: 2, AS: 'course_dept' },
                '$.course_code': { type: SchemaFieldTypes.TEXT, WEIGHT: 2, AS: 'course_code' },
                '$.class_section': { type: SchemaFieldTypes.TEXT, AS: 'class_section' },
                '$.course_title': { type: SchemaFieldTypes.TEXT, WEIGHT: 2, AS: 'course_title' },
                '$.school': { type: SchemaFieldTypes.TEXT, AS: 'school' },
                '$.career': { type: SchemaFieldTypes.TEXT, AS: 'career' },
                '$.class_type': { type: SchemaFieldTypes.TEXT, AS: 'class_type' },
                '$.credit_hours': { type: SchemaFieldTypes.TEXT, AS: 'credit_hours' },
                '$.grading_basis': { type: SchemaFieldTypes.TEXT, AS: 'grading_basis' },
                '$.consent': { type: SchemaFieldTypes.TEXT, AS: 'consent' },
                '$.term_year': { type: SchemaFieldTypes.NUMERIC, AS: 'term_year' },
                '$.term_season': { type: SchemaFieldTypes.TEXT, AS: 'term_season' },
                '$.session': { type: SchemaFieldTypes.TEXT, AS: 'session' },
                '$.dates': { type: SchemaFieldTypes.TEXT, AS: 'dates' },
                '$.requirements': { type: SchemaFieldTypes.TEXT, AS: 'requirements' },
                '$.description': { type: SchemaFieldTypes.TEXT, AS: 'description' },
                '$.notes': { type: SchemaFieldTypes.TEXT, AS: 'notes' },
                '$.status': { type: SchemaFieldTypes.TEXT, AS: 'status' },
                '$.capacity': { type: SchemaFieldTypes.NUMERIC, AS: 'capacity' },
                '$.enrolled': { type: SchemaFieldTypes.NUMERIC, AS: 'enrolled' },
                '$.wl_capacity': { type: SchemaFieldTypes.NUMERIC, AS: 'wl_capacity', },
                '$.wl_occupied': { type: SchemaFieldTypes.NUMERIC, AS: 'wl_occupied', },
                '$.attributes': { type: SchemaFieldTypes.TAG, AS: 'attributes', },
                '$.meeting_days': { type: SchemaFieldTypes.TAG, AS: 'meeting_days' },
                '$.meeting_times': { type: SchemaFieldTypes.TAG, AS: 'meeting_times' },
                '$.meeting_dates': { type: SchemaFieldTypes.TAG, AS: 'meeting_dates' },
                '$.instructors[*]': { type: SchemaFieldTypes.TEXT, NOSTEM: true, AS: 'instructors' }, // treat each instructor as separate value
                // '$.instructors[*]': { type: SchemaFieldTypes.TEXT, AS: 'instructors', NOSTEM: true, PHONETIC: 'dm:en' } // only ioredis supports phonetic rip
            }, {
            ON: 'JSON',
            PREFIX: 'course:',
            NOOFFSETS: true,
        });
    } catch (err: any) {
        if (err.message?.includes('Index already exists')) {
            console.log('Index already exists, skipping creation.');
        } else {
            console.error(err);
        }
    }

    // const seen = new Set<string>();

    // for (let i = 0; i < courses.length; i++) {
    //     const course = courses[i];
    //     const key = `course:${course.Id}`;

    //     if (seen.has(key)) {
    //         throw new Error(`Duplicate course id: ${course.Id}`);
    //     }
    //     seen.add(key);

    //     const exists = await redisClient.exists(key);

    //     if (exists) {
    //         // Only update specific fields (e.g., title and description)
    //         const currentTitle = await redisClient.json.get(key, { path: '$.title' });
    //         if (currentTitle?.[0] !== course.title) {
    //             await redisClient.json.set(key, '$.title', course.title);
    //         }
    //         // await redisClient.json.set(key, '$.title', course.title);

    //         await redisClient.json.set(key, '$.description', course.description);
    //     } else {
    //         // New course — insert full object
    //         await redisClient.json.set(key, '$', course as any);
    //     }
    // }

    // await redisClient.quit();

    console.log(courses.length);

    const BATCH_SIZE = 3000;

    let pipeline = redisClient.multi(); // multi is pipeline in node-redis
    let count = 0;

    for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        const key = `course:${course.id}`;

        const setResult = await redisClient.json.set(key, '$', course as Record<string, any>, { NX: true }); // NX -> only run if key nonexistent

        if (setResult !== 'OK') { // key exists, equivalent to XX
            const existing = await redisClient.json.get(key) as Record<string, any>;

            for (const [field, newVal] of Object.entries(course)) {
                const oldVal = existing?.[field];
                if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                    pipeline.json.set(key, `$.${field}`, newVal as any);
                }
            }

        }

        ++count;
        if (count % 100 == 0) console.log(`${count}/${courses.length}`);
        if (count >= BATCH_SIZE || i === courses.length - 1) {
            await pipeline.exec();
            pipeline = redisClient.multi();
            count = 0;
        }
    }
    
    
    // await redisClient.flushDb(); // delete our data
    
    const info = await redisClient.info('memory');
    console.log(info); // includes 'used_memory', 'maxmemory'

    // await redisClient.quit();
}


// const seen = new Set<string>();
// let pipeline = redisClient.multi();

// for (let i = 0; i < courses.length; i++) {
//     const course = courses[i];
//     const key = course: ${ course.Id };

//     if (seen.has(key)) {
//         throw new Error(Duplicate course id: ${ course.Id });
//     }
//     seen.add(key);

//     pipeline.json.set(key, '$', course as any);

//     if (i % 4000 === 3999 || i === courses.length - 1) {
//         const results = await pipeline.exec();
//         for (const [err] of results) {
//             if (err) throw new Error(Pipeline error: ${ err.message });
//         }
//         pipeline = redisClient.multi(); // reset pipeline
//     }
// }

// Get cached course data
export async function getCachedCourses(): Promise<Course[] | null> {
    try {
        // const cachedData = await redisClient.get('courses');

        let query = "*"; // default query (match all documents)
        const result: RedisSearchResult = await redisClient.ft.search(
            'idx:course',
            query,
            {
                LIMIT: {
                    from: 0,
                    size: 300, // limit to 300 for now
                },
            }
        );

        const cachedData = result["documents"];

        if (cachedData) {
            return cachedData;
        }

        return null;
    } catch (error) {
        console.error('Error getting cached courses:', error);
        return null;
    }
}

// Get cached search results
export async function getCachedSearchResults(query: string): Promise<Course[] | null> {
    try {

        // if (query && query.trim().length > 1) {
        //     query = `${query}*`;
        // } else {
        //     query = "*";
        // }
        console.log("query", query);
        const result: RedisSearchResult = await redisClient.ft.search(
            'idx:course',
            // `(@description:${query}) | (@course_title:${query})`,
            // query,
            `(@description:${query}) | (@course_title:${query}) | (@course_dept:${query}) | (@course_code:${query}) | (@instructors:${query}) | (@attributes:${query})`,
            {
                RETURN: [],
                LIMIT: {
                    from: 0,
                    size: 300, // limit to 300 for now
                },
            }
        );

        // result has fields "total" and "documents"
        const cachedData: Course[] = result["documents"];

        if (cachedData) {
            console.log(`Search results for "${query}" cached successfully`);
            return cachedData;
        }

        return null;

    } catch (error) {
        console.error(`Error getting cached search results for "${query}":`, error);
        return null;
    }
} 