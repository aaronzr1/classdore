import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Course } from './course.model';

const write = true;
const del = false;

dotenv.config();

const uploadData = async () => {
  try {
    // relative to server/
    const data = JSON.parse(fs.readFileSync('../data/data.json', 'utf-8'));

    // data.forEach((courseData: any) => {
    //     if (!courseData.meeting_times) {
    //         console.log("Missing meeting_times for:", courseData.class_number);
    //     }
    // });

    const operations = data.map((courseData: any) => ({
      updateOne: {
        filter: { class_number: courseData.class_number },
        update: {
          $set: {
            class_number: courseData.class_number,
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
            status: courseData.status,
            capacity: parseInt(courseData.capacity),
            enrolled: parseInt(courseData.enrolled),
            wl_capacity: parseInt(courseData.wl_capacity),
            wl_occupied: parseInt(courseData.wl_occupied),
            attributes: courseData.attributes,
            meeting_days: courseData.meeting_days,
            meeting_times: courseData.meeting_times,
            meeting_dates: courseData.meeting_dates,
            instructors: courseData.instructors,
          },
        },
        upsert: true, // Create a new entry if none exists
      },
    }));

    await Course.bulkWrite(operations, {
      ordered: false,
      writeConcern: { w: 1 },
    });
    console.log('Data successfully uploaded');
  } catch (error) {
    console.error('Error uploading data:', error);
  }
};

const deleteData = async () => {
  const result = await Course.deleteMany({});
  console.log(`${result.deletedCount} documents deleted.`);
};

const verifyData = async () => {
  const num = await Course.countDocuments();
  console.log('Number of courses in database:', num);
};

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('Connected to MongoDB Atlas');

    if (del) {
      await deleteData();
    }

    if (write) {
      await uploadData();
    }

    await verifyData();
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

main();

const getAllCourses = async () => {
  try {
    // const courses = await Course.find({ course_dept: "CS" });
    const courses = await Course.find(); // Retrieves all documents
    console.log(courses);
  } catch (error) {
    console.error('Error retrieving courses:', error);
  }
};
