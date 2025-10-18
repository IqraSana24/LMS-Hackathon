// C:\Users\harin\LMS-Hackathon\lms-backend\models\Student.js

const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: { // Store the hashed password
        type: String,
        required: true
    },
    enrolledCourses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        enrolledAt: { type: Date, default: Date.now }
    }],
    notifications: [{
        type: { type: String, enum: ['assignment_deadline', 'new_course', 'course_update', 'general'], required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        assignmentId: { type: String },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);