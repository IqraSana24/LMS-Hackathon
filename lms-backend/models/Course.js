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
    materials: [ // Course materials (PDFs/PPTs)
        {
            originalName: String,
            fileName: String,
            filePath: String,
            fileType: String,
            uploadedAt: { type: Date, default: Date.now }
        }
    ],
    lessons: [ // Embedded lesson subdocuments
        {
            title: { type: String, required: true },
            content: { type: String, required: true },
            order: { type: Number, default: 1 },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    assignments: [ // Embedded assignment subdocuments
        {
            title: { type: String, required: true },
            description: { type: String, required: true },
            dueDate: { type: Date },
            maxScore: { type: Number, default: 100 },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    enrollments: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);