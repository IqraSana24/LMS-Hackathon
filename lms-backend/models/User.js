// C:\Users\harin\LMS-Hackathon\lms-backend\models\User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
    role: { // Differentiate staff/teacher/admin
        type: String,
        enum: ['Staff', 'Teacher', 'Admin'],
        default: 'Staff'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);