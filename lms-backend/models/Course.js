// lms-backend/models/Course.js (UPDATED)

const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    duration: { type: String, default: 'Self-Paced' },
    instructor: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    lessons: [{ // NEW: Reference Lesson documents
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    assignments: [{ // NEW: Reference Assignment documents
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
    }],
    enrollments: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);