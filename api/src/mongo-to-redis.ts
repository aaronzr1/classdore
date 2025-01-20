import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Course, redisCourseSchema } from './course.model';
import { createClient } from 'redis';
import {
  AggregateGroupByReducers,
  AggregateSteps,
  SchemaFieldTypes,
} from 'redis';

dotenv.config();

const getAllCourses = async () => {
  try {
    const courses = await Course.find(); // Retrieves all documents
    console.log(courses);
  } catch (error) {
    console.error('Error retrieving courses:', error);
  }
};

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('Connected to MongoDB Atlas');

    const client = createClient({
      username: 'default',
      password: process.env.REDIS_PSW,
      socket: {
        host: 'redis-15815.c322.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 15815,
      },
    });

    client.on('error', (err: any) => console.log('Redis Client Error', err));
    await client.connect();
    await client.flushDb(); // delete our data

    try {
      await client.ft.create(
        'idx:course',
        {
          '$.class_number': {
            type: SchemaFieldTypes.TEXT,
            AS: 'class_number',
          },
          '$.course_dept': {
            type: SchemaFieldTypes.TEXT,
            AS: 'course_dept',
          },
          '$.course_code': {
            type: SchemaFieldTypes.TEXT,
            AS: 'course_code',
          },
          '$.class_section': {
            type: SchemaFieldTypes.TEXT,
            AS: 'class_section',
          },
          '$.course_title': {
            type: SchemaFieldTypes.TEXT,
            AS: 'course_title',
          },
          '$.school': {
            type: SchemaFieldTypes.TEXT,
            AS: 'school',
          },
          '$.career': {
            type: SchemaFieldTypes.TEXT,
            AS: 'career',
          },
          '$.class_type': {
            type: SchemaFieldTypes.TEXT,
            AS: 'class_type',
          },
          '$.credit_hours': {
            type: SchemaFieldTypes.TEXT,
            AS: 'credit_hours',
          },
          '$.grading_basis': {
            type: SchemaFieldTypes.TEXT,
            AS: 'grading_basis',
          },
          '$.consent': {
            type: SchemaFieldTypes.TEXT,
            AS: 'consent',
          },
          '$.term_year': {
            type: SchemaFieldTypes.NUMERIC,
            AS: 'term_year',
          },
          '$.term_season': {
            type: SchemaFieldTypes.TEXT,
            AS: 'term_season',
          },
          '$.session': {
            type: SchemaFieldTypes.TEXT,
            AS: 'session',
          },
          '$.dates': {
            type: SchemaFieldTypes.TEXT,
            AS: 'dates',
          },
          '$.requirements': {
            type: SchemaFieldTypes.TEXT,
            AS: 'requirements',
          },
          '$.description': {
            type: SchemaFieldTypes.TEXT,
            AS: 'description',
          },
          '$.notes': {
            type: SchemaFieldTypes.TEXT,
            AS: 'notes',
          },
          '$.status': {
            type: SchemaFieldTypes.TEXT,
            AS: 'status',
          },
          '$.capacity': {
            type: SchemaFieldTypes.NUMERIC,
            AS: 'capacity',
          },
          '$.enrolled': {
            type: SchemaFieldTypes.NUMERIC,
            AS: 'enrolled',
          },
          '$.wl_capacity': {
            type: SchemaFieldTypes.NUMERIC,
            AS: 'wl_capacity',
          },
          '$.wl_occupied': {
            type: SchemaFieldTypes.NUMERIC,
            AS: 'wl_occupied',
          },
          '$.attributes': {
            type: SchemaFieldTypes.TAG,
            AS: 'attributes',
          },
          '$.meeting_days': {
            type: SchemaFieldTypes.TAG,
            AS: 'meeting_days',
          },
          '$.meeting_times': {
            type: SchemaFieldTypes.TAG,
            AS: 'meeting_times',
          },
          '$.meeting_dates': {
            type: SchemaFieldTypes.TAG,
            AS: 'meeting_dates',
          },
          '$.instructors': {
            type: SchemaFieldTypes.TAG,
            AS: 'instructors',
          },
        },
        {
          ON: 'JSON',
          PREFIX: 'course'
        }
      );
    } catch (e: any) {
      if (e.message === 'Index already exists') {
        console.log('Index exists already, skipped creation.');
      } else {
        console.error(e);
        process.exit(1);
      }
    }

    const courses = await Course.find(); // Retrieves all documents

    // function storeCoursesInRedis(courses) {
    // Use Redis Hash to store each course by its ID
    // courses.forEach(course => {
    //     const courseId = course._id.toString(); // Use MongoDB's ObjectId

    //     // Store each course as a Redis hash
    //     client.hSet(`course:${courseId}`, {
    //         'class_number': course.class_number,
    //         'course_dept': course.course_dept,
    //         'course_code': course.course_code,
    //         'class_section': course.class_section,
    //         'course_title': course.course_title,
    //         'school': course.school,
    //         'career': course.career,
    //         'class_type': course.class_type,
    //         'credit_hours': course.credit_hours,
    //         'grading_basis': course.grading_basis,
    //         'consent': course.consent,
    //         'term_year': course.term_year,
    //         'term_season': course.term_season,
    //         'session': course.session,
    //         'dates': course.dates,
    //         'requirements': course.requirements,
    //         'description': course.description ?? '',
    //         'notes': course.notes ?? '',
    //         'status': course.status,
    //         'capacity': course.capacity,
    //         'enrolled': course.enrolled,
    //         'wl_capacity': course.wl_capacity,
    //         'wl_occupied': course.wl_occupied,
    //         'attributes': course.attributes?.join(',') ?? '',
    //         'meeting_days': course.meeting_days?.join(','),
    //         'meeting_times': course.meeting_times?.join(','),
    //         'meeting_dates': course.meeting_dates?.join(','),
    //         'instructors': course.instructors?.join(',')
    //     });
    // });

    courses.forEach((course) => {
      const courseId = course._id.toString(); // Use MongoDB's ObjectId

      // Store each course as a JSON object
      client.json.set(`course:${courseId}`, '$', {
        class_number: course.class_number,
        course_dept: course.course_dept,
        course_code: course.course_code,
        class_section: course.class_section,
        course_title: course.course_title,
        school: course.school,
        career: course.career,
        class_type: course.class_type,
        credit_hours: course.credit_hours,
        grading_basis: course.grading_basis,
        consent: course.consent,
        term_year: course.term_year,
        term_season: course.term_season,
        session: course.session,
        dates: course.dates,
        requirements: course.requirements,
        description: course.description ?? null,
        notes: course.notes ?? null,
        status: course.status,
        capacity: course.capacity,
        enrolled: course.enrolled,
        wl_capacity: course.wl_capacity,
        wl_occupied: course.wl_occupied,
        attributes: course.attributes ?? null,
        meeting_days: course.meeting_days,
        meeting_times: course.meeting_times,
        meeting_dates: course.meeting_dates,
        instructors: course.instructors,
      });
    });

    const result = await client.ft.search(
      'idx:course',
      '@description:*transport* @course_dept:MATH',
      {
        LIMIT: {
          from: 0,
          size: 10,
        },
      }
    );
    console.log(JSON.stringify(result, null, 2));

    // await client.disconnect();
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
  }
}

main();

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
// removeAllCourses();

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
