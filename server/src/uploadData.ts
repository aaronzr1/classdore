import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { Course } from './course.model';
import Redis from 'ioredis';

dotenv.config({ path: '../.env' });

mongoose.connect(process.env.MONGO_URI || '')
    .then(() => {
        console.error('Connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
    });

// Upload data
const uploadData = async () => {
    try {
        const data = JSON.parse(fs.readFileSync('../../data/data.json', 'utf-8'));

        // Prepare all course data to be inserted or updated
        const operations = [];

        for (const key in data) {
            const courseData = data[key];

            operations.push({
                updateOne: {
                    filter: { class_number: key },
                    update: {
                        $set: {
                            class_number: key,
                            course_dept: courseData.course_dept,
                            course_code: courseData.course_code,
                            class_section: courseData.class_section,
                            course_title: courseData.course_title,
                            school: courseData.school,
                            career: courseData.career,
                            class_type: courseData.class_type,
                            credit_hours: courseData.credit_hours,
                            grading_basis: courseData.grading_basis,
                            consent: courseData.consent,
                            term_year: parseInt(courseData.term_year),
                            term_season: courseData.term_season,
                            session: courseData.session,
                            dates: courseData.dates,
                            requirements: courseData.requirements,
                            description: courseData.description,
                            notes: courseData.notes,
                            availability: courseData.availability,
                            attributes: courseData.attributes,
                            meeting: courseData.meeting
                        }
                    },
                    upsert: true // replace existing entries
                }
            });
        }

        await Course.bulkWrite(operations, { ordered: false, writeConcern: { w: 1 } });
        console.log('Data successfully uploaded');
    } catch (error) {
        console.error('Error uploading data:', error);
    } finally {
        console.log("exiting uploadData process");
        mongoose.connection.close();
    }
};

let write = true;
let del = false;

if (write && !del) uploadData();

// const verifyData = async () => {
//     // const courses = await Course.find({ course_dept: "CS" });
//     const num = await Course.countDocuments();
//     console.log('Number of courses in database:', num);
//     mongoose.connection.close();
// };

// verifyData();

if (del) {
    mongoose
        .connect(process.env.MONGO_URI || '')
    .then(async () => {
        console.log('Connected to MongoDB Atlas');

        // Delete all documents in the collection
        const result = await Course.deleteMany({});
        console.log(`${result.deletedCount} documents deleted.`);

        mongoose.connection.close();
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
    });
}

const getAllCourses = async () => {
    try {
        const courses = await Course.find(); // Retrieves all documents
        console.log(courses);
    } catch (error) {
        console.error('Error retrieving courses:', error);
    }
};

// getAllCourses();

const redis = new Redis();
// redis.set('searchQuery', JSON.stringify(courseData));  // Example for caching search data
const storeCourseInRedis = async (classNumber: string) => {
    try {
        const course = await Course.findOne({ class_number: classNumber });

        if (course) {
            // Serialize course data to a string
            await redis.set(classNumber, JSON.stringify(course));
            console.log('Course stored in Redis');
        } else {
            console.log('Course not found');
        }
    } catch (error) {
        console.error('Error retrieving and storing course:', error);
    }
};

// Example usage
// storeCourseInRedis('4755');

const removeCourse = async (classNumber: string) => {
    try {
        // Remove the course from Redis using the class_number as the key
        await redis.del(classNumber);
        console.log(`Course with class_number ${classNumber} has been removed from Redis.`);
    } catch (error) {
        console.error('Error removing course from Redis:', error);
    }
};

// Example usage: remove the course with class_number "4755"
// removeCourse("4755");

// Store all courses in Redis
const storeAllCoursesInRedis = async () => {
    try {
        const courses = await Course.find();
        // Serialize array of courses
        await redis.set('all_courses', JSON.stringify(courses));
        console.log('All courses stored in Redis');
    } catch (error) {
        console.error('Error retrieving and storing courses:', error);
    }
};
storeAllCoursesInRedis();

// Remove all courses from Redis
const removeAllCourses = async () => {
    try {
        // Get all keys that match the pattern (if needed, you can adjust the pattern)
        const keys = await redis.keys('*'); // This gets all keys, you may adjust to a pattern like 'course:*'

        if (keys.length > 0) {
            // Delete all keys (courses)
            await redis.del(keys);
            console.log(`All courses have been removed from Redis.`);
        } else {
            console.log('No courses found in Redis to remove.');
        }
    } catch (error) {
        console.error('Error removing courses from Redis:', error);
    }
};

// Example usage: remove all courses
removeAllCourses();

// Retrieve all courses from Redis
const getAllCoursesFromRedis = async () => {
    try {
        const coursesData = await redis.get('all_courses');
        if (coursesData) {
            // Parse the JSON string back into an array
            const courses = JSON.parse(coursesData);
            console.log(courses);
        } else {
            console.log('No courses found in Redis');
        }
    } catch (error) {
        console.error('Error retrieving courses from Redis:', error);
    }
};

// getAllCoursesFromRedis()