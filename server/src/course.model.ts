import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
    class_number: string;
    course_dept: string;
    course_code: string;
    class_section: string;
    course_title: string;
    school: string;
    career: string;
    class_type: string;
    credit_hours: string;
    grading_basis: string;
    consent: string;
    term_year: number;
    term_season: string;
    session: string;
    dates: string;
    requirements: string;
    description: string | null;
    notes: string | null;
    availability: {
        status: string;
        capacity: number;
        enrolled: number;
        wl_capacity: number;
        wl_occupied: number;
    };
    attributes: string[] | null;
    meeting: {
        meeting_days: string;
        meeting_time: string;
        meeting_dates: string;
        instructors: string[];
    }[];
}

const courseSchema = new Schema<ICourse>({
    class_number: String,
    course_dept: { type: String, required: false },
    course_code: { type: String, required: false },
    class_section: String,
    course_title: String,
    school: String,
    career: String,
    class_type: String,
    credit_hours: String,
    // credit_hours: { type: string, min: 1 },
    grading_basis: String,
    consent: String,
    term_year: { type: Number, required: false },
    term_season: String,
    session: String,
    dates: String,
    requirements: String,
    description: { type: String, default: null },
    notes: { type: String, default: null },
    availability: {
        status: String,
        capacity: { type: Number, min: 0 },
        enrolled: { type: Number, min: 0 },
        wl_capacity: { type: Number, min: 0 },
        wl_occupied: { type: Number, min: 0 }
    },
    attributes: { type: [String], default: null },
    meeting: [
        {
            meeting_days: String,
            meeting_time: String,
            meeting_dates: String,
            instructors: [{ type: String }]
        }
    ]
}, { minimize: false });

export const Course = mongoose.model<ICourse>('Course', courseSchema);