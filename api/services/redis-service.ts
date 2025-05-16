import { createClient, SchemaFieldTypes } from 'redis';
import { Course, RedisSearchResult } from '@/../../shared/course';
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

export async function indexCourses(courses: Course[]): Promise<void> {

    // await redisClient.ft.dropIndex('idx:courses', { DD: false }); // DD is drop data

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
                '$.instructors[*]': { type: SchemaFieldTypes.TEXT, NOSTEM: true, AS: 'instructors' } // treat each instructor as separate value
                // '$.instructors[*]': { type: SchemaFieldTypes.TEXT, AS: 'instructors', NOSTEM: true, PHONETIC: 'dm:en' } // only ioredis supports phonetic rip
            }, {
            ON: 'JSON',
            PREFIX: 'course:',
            // NOOFFSETS: true,
        });
        console.log('Index created.');
    } catch (err: any) {
        if (err.message?.includes('Index already exists')) {
            console.log('Index already exists, skipping creation.');
        } else {
            console.error(err);
        }
    }

    // Pipeline and upload data
    const BATCH_SIZE = 1000;
    let pipeline = redisClient.multi(); // multi is pipeline in node-redis
    let count = 0;

    for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        const key = `course:${course.id}`;

        const existing = await redisClient.json.get(key) as Record<string, any>;

        if (!existing) {

            // Add new if not exists
            console.log(`not existing: ${key}`)
            pipeline.json.set(key, '$', course as Record<string, any>, { NX: true });

        } else {

            // Only update changed fields
            for (const [field, newVal] of Object.entries(course)) {
                const oldVal = existing?.[field];
                if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                    console.log(`change in field: ${key} with field ${newVal} (prev ${oldVal})`)
                    pipeline.json.set(key, `$.${field}`, newVal as any);
                }
            }

        }

        ++count;
        if (count % 100 == 0) console.log(`${count}/${courses.length}`);
        if (count % BATCH_SIZE == 0 || i === courses.length - 1) {
            await pipeline.exec();
            pipeline = redisClient.multi();
        }
    }

    // debug utilities

    // await redisClient.flushDb(); // delete our data

    // const info = await redisClient.info('memory');
    // console.log(info); // includes 'used_memory', 'maxmemory'

    // for (const [key, value] of Object.entries(courses[0])) {
    //     console.log(`${key}: ${typeof value}`);
    // }
}

export async function searchCourses(query: string): Promise<Course[] |  null> {
    try {

        console.log("Querying: ", query);
        const result: RedisSearchResult = await redisClient.ft.search(
            'idx:courses',
            query,
            {
                // RETURN: [],
                LIMIT: {
                    from: 0,
                    size: 300,
                },
            }
        );
        
        // RedisSearchResults have weird formatting, we just unpack it here instead of later downstream
        const unpackedData = result.documents.map(doc => doc.value);
        
        return unpackedData;

    } catch (error) {
        console.error(`Error searching results for "${query}":`, error);
        return null;
    }
} 