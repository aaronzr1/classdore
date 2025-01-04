import mongoose, { Document, Schema } from 'mongoose';
import { SchemaFieldTypes } from 'redis';

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

export const redisCourseSchema = {
    '$.class_number': {
        type: SchemaFieldTypes.TEXT,
        AS: 'class_number'
    },
    '$.course_dept': {
        type: SchemaFieldTypes.TEXT,
        AS: 'course_dept'
    },
    '$.course_code': {
        type: SchemaFieldTypes.TEXT,
        AS: 'course_code'
    },
    '$.class_section': {
        type: SchemaFieldTypes.TEXT,
        AS: 'class_section'
    },
    '$.course_title': {
        type: SchemaFieldTypes.TEXT,
        AS: 'course_title'
    },
    '$.school': {
        type: SchemaFieldTypes.TEXT,
        AS: 'school'
    },
    '$.career': {
        type: SchemaFieldTypes.TEXT,
        AS: 'career'
    },
    '$.class_type': {
        type: SchemaFieldTypes.TEXT,
        AS: 'class_type'
    },
    '$.credit_hours': {
        type: SchemaFieldTypes.TEXT,
        AS: 'credit_hours'
    },
    '$.grading_basis': {
        type: SchemaFieldTypes.TEXT,
        AS: 'grading_basis'
    },
    '$.consent': {
        type: SchemaFieldTypes.TEXT,
        AS: 'consent'
    },
    '$.term_year': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'term_year'
    },
    '$.term_season': {
        type: SchemaFieldTypes.TEXT,
        AS: 'term_season'
    },
    '$.session': {
        type: SchemaFieldTypes.TEXT,
        AS: 'session'
    },
    '$.dates': {
        type: SchemaFieldTypes.TEXT,
        AS: 'dates'
    },
    '$.requirements': {
        type: SchemaFieldTypes.TEXT,
        AS: 'requirements'
    },
    '$.description': {
        type: SchemaFieldTypes.TEXT,
        AS: 'description'
    },
    '$.notes': {
        type: SchemaFieldTypes.TEXT,
        AS: 'notes'
    },
    '$.availability.status': {
        type: SchemaFieldTypes.TEXT,
        AS: 'availability_status'
    },
    '$.availability.capacity': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'availability_capacity'
    },
    '$.availability.enrolled': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'availability_enrolled'
    },
    '$.availability.wl_capacity': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'availability_wl_capacity'
    },
    '$.availability.wl_occupied': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'availability_wl_occupied'
    },
    '$.attributes': {
        type: SchemaFieldTypes.TAG,
        AS: 'attributes'
    },
    '$.meeting': {
        type: SchemaFieldTypes.TEXT,
        AS: 'meeting'
    }
};
