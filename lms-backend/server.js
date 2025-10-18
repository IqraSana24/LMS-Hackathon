// server.js (Final Code with Mongoose and Multer Integration)

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');       // NEW: For file handling
const path = require('path');           // NEW: For file paths
const fs = require('fs');               // NEW: For file system operations

// --- IMPORTANT: Placeholder Mongoose Models ---
// NOTE: Assuming your actual models (User, Student, Course) are required here.
// The code below assumes User and Student models use 'passwordHash' field for storage.
const User = require('./models/User'); 
const Student = require('./models/Student');
const Course = require('./models/Course');

dotenv.config();

const app = express();
// NOTE: Using PORT 5000 as indicated by your last successful run
const PORT = process.env.PORT || 5000; 
const MONGO_URI = process.env.MONGO_URI; 

// --- Middleware & File System Setup ---
app.use(cors());
app.use(express.json());

// Create 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
// Serve static files from the 'uploads' directory for public access (e.g., viewing PDFs)
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connection successful!'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be stored in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Ensure unique filename: fieldname-timestamp.ext
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype.includes('powerpoint') || file.originalname.match(/\.(pdf|ppt|pptx)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and PPT/PPTX files are allowed!'), false);
        }
    }
});
// --- END MULTER CONFIGURATION ---


// --- Mongoose Schemas (Defining the Course Schema here as it was missing a definition) ---

// Course Schema - UPDATED to include materials, lessons, and assignments
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  materials: [ // Course materials (PDFs/PPTs)
    {
      originalName: String,
      fileName: String, // Stored filename on server
      filePath: String, // Path to access the file (e.g., /uploads/file.pdf)
      fileType: String, // 'pdf' or 'ppt'
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  lessons: [ // Course lessons
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
      order: { type: Number, default: 1 },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  assignments: [ // Course assignments
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      dueDate: { type: Date },
      maxScore: { type: Number, default: 100 },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

// Assuming the Course model is defined here if not in a separate file
try {
    mongoose.model('Course', CourseSchema);
} catch (e) {
    // Already defined, ignore
}

// --- HELPER FUNCTION (using bcrypt) ---
const SALT_ROUNDS = 10;


// --- AUTH ROUTES ---

// Register Staff/Teacher (User)
app.post('/api/register', async (req, res) => {
	const {name, email, password, role = 'Staff'} = req.body || {};
	if (!name || !email || !password) return res.status(400).json({error: 'name, email and password are required'});

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({error: 'user already exists'});

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        
        const newUser = new User({ name, email, passwordHash, role }); // Use passwordHash
        await newUser.save();

        const {passwordHash: _, ...safeUser} = newUser.toObject();
        res.status(201).json({user: safeUser});
    } catch (err) {
        console.error("Staff Registration Error:", err);
        res.status(500).json({error: 'internal_server_error'});
    }
});

// Register Student (No changes needed)
app.post('/api/register-student', async (req, res) => {
	const {name, email, password} = req.body || {};
	if (!name || !email || !password) return res.status(400).json({error: 'name, email and password are required'});

    try {
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) return res.status(409).json({error: 'student already exists'});

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        
        const newStudent = new Student({ name, email, passwordHash });
        await newStudent.save();

        const {passwordHash: _, ...safeStudent} = newStudent.toObject();
        res.status(201).json({student: safeStudent});
    } catch (err) {
        console.error("Student Registration Error:", err);
        res.status(500).json({error: 'internal_server_error'});
    }
});

// Login Staff/Teacher (User) - FIX APPLIED
app.post('/api/login', async (req, res) => {
	const {email, password} = req.body || {};
	if (!email || !password) return res.status(400).json({error: 'email and password required'});

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({error: 'invalid credentials'});

        // FIX: Compare against the passwordHash field
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({error: 'invalid credentials'});

        const {passwordHash: _, ...safeUser} = user.toObject();
        res.json({user: safeUser});
    } catch (err) {
        console.error("Staff Login Error:", err);
        res.status(500).json({error: 'internal_server_error'});
    }
});

// Student login (No changes needed)
app.post('/api/login-student', async (req, res) => {
	const {email, password} = req.body || {};
	if (!email || !password) return res.status(400).json({error: 'email and password required'});

    try {
        const student = await Student.findOne({ email });
        if (!student) return res.status(401).json({error: 'invalid credentials'});

        const isMatch = await bcrypt.compare(password, student.passwordHash);
        if (!isMatch) return res.status(401).json({error: 'invalid credentials'});

        const {passwordHash: _, ...safeStudent} = student.toObject();
        res.json({student: safeStudent});
    } catch (err) {
        console.error("Student Login Error:", err);
        res.status(500).json({error: 'internal_server_error'});
    }
});


// --- COURSE API Endpoints ---

// Get all courses (for student dashboard/overview)
app.get('/api/courses', async (req, res) => {
    try {
        const coursesList = await Course.find({})
                                        .populate('instructor', 'name -_id'); 
        res.json({courses: coursesList});
    } catch (err) {
        console.error("Get Courses Error:", err);
        res.status(500).json({error: 'internal_server_error'});
    }
});

// Get courses created by a specific instructor (Teacher functionality)
app.get('/api/courses/instructor/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        
        const coursesList = await Course.find({ instructor: instructorId })
                                        .populate('instructor', 'name email -_id');

        res.json({courses: coursesList}); 
    } catch (err) {
        console.error("Get Instructor Courses Error:", err);
        res.status(500).json({error: 'internal_server_error'});
    }
});

// Create a course (Teacher functionality)
app.post('/api/courses', async (req, res) => {
    const {title, description, duration, instructorId} = req.body || {}; 
    if (!title || !description || !duration || !instructorId) {
        return res.status(400).json({error: 'title, description, duration, and instructorId are required'});
    }

    try {
        const instructor = await User.findById(instructorId);
        if (!instructor) return res.status(404).json({error: 'Instructor not found'});

        const newCourse = new Course({ 
            title, 
            description, 
            duration, 
            instructor: instructorId 
        });
        await newCourse.save();

        // Notify all students about new course
        const allStudents = await Student.find({});
        for (const student of allStudents) {
            student.notifications.push({
                type: 'new_course',
                title: 'New Course Available!',
                message: `A new course "${title}" has been added by ${instructor.name}. Check it out!`,
                courseId: newCourse._id,
                isRead: false,
                createdAt: new Date()
            });
            await student.save();
        }

        res.status(201).json({course: newCourse});
    } catch (err) {
        console.error("Create Course Error:", err);
        res.status(500).json({error: 'internal_server_error'});
    }
});

// --- ENROLLMENT ROUTES ---

// Enroll a student in a course
app.post('/api/enroll', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        
        if (!studentId || !courseId) {
            return res.status(400).json({ message: 'Student ID and Course ID are required' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const CourseModel = mongoose.model('Course');
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        const alreadyEnrolled = student.enrolledCourses?.some(
            enrollment => enrollment.courseId.toString() === courseId
        );

        if (alreadyEnrolled) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Add course to student's enrolledCourses
        if (!student.enrolledCourses) {
            student.enrolledCourses = [];
        }
        student.enrolledCourses.push({
            courseId: courseId,
            enrolledAt: new Date()
        });
        await student.save();

        res.status(200).json({ 
            message: 'Successfully enrolled in course!', 
            enrolledCourses: student.enrolledCourses 
        });
    } catch (err) {
        console.error('Enrollment Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get enrolled courses for a student
app.get('/api/students/:studentId/enrolled-courses', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const student = await Student.findById(studentId).populate('enrolledCourses.courseId');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ enrolledCourses: student.enrolledCourses || [] });
    } catch (err) {
        console.error('Get Enrolled Courses Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get a single course by ID (for viewing course details)
app.get('/api/courses/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const CourseModel = mongoose.model('Course');
        const course = await CourseModel.findById(courseId).populate('instructor', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ course });
    } catch (err) {
        console.error('Get Course Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// --- NOTIFICATION ROUTES ---

// Get all notifications for a student
app.get('/api/students/:studentId/notifications', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Sort notifications by date (newest first)
        const notifications = (student.notifications || []).sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.json({ notifications, unreadCount: notifications.filter(n => !n.isRead).length });
    } catch (err) {
        console.error('Get Notifications Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Mark notification as read
app.patch('/api/students/:studentId/notifications/:notificationId/read', async (req, res) => {
    try {
        const { studentId, notificationId } = req.params;
        const student = await Student.findById(studentId);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const notification = student.notifications.id(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        await student.save();

        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Mark Notification Read Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Mark all notifications as read
app.patch('/api/students/:studentId/notifications/read-all', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.notifications.forEach(notification => {
            notification.isRead = true;
        });
        await student.save();

        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Mark All Read Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Check for upcoming assignment deadlines and create notifications
app.post('/api/students/:studentId/check-deadlines', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId).populate('enrolledCourses.courseId');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const CourseModel = mongoose.model('Course');
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
        let newNotifications = 0;

        // Check all enrolled courses for upcoming assignment deadlines
        for (const enrollment of student.enrolledCourses) {
            if (!enrollment.courseId) continue;
            
            const course = await CourseModel.findById(enrollment.courseId._id);
            if (!course || !course.assignments) continue;

            for (const assignment of course.assignments) {
                if (!assignment.dueDate) continue;
                
                const dueDate = new Date(assignment.dueDate);
                
                // Check if due date is within 3 days
                if (dueDate > now && dueDate <= threeDaysFromNow) {
                    // Check if notification already exists
                    const existingNotification = student.notifications.find(n => 
                        n.type === 'assignment_deadline' && 
                        n.assignmentId === assignment._id.toString()
                    );

                    if (!existingNotification) {
                        const daysUntilDue = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));
                        student.notifications.push({
                            type: 'assignment_deadline',
                            title: `Assignment Due Soon: ${assignment.title}`,
                            message: `Your assignment "${assignment.title}" in ${course.title} is due in ${daysUntilDue} day(s)!`,
                            courseId: course._id,
                            assignmentId: assignment._id.toString(),
                            isRead: false,
                            createdAt: new Date()
                        });
                        newNotifications++;
                    }
                }
            }
        }

        await student.save();
        res.json({ message: 'Deadline check complete', newNotifications });
    } catch (err) {
        console.error('Check Deadlines Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// NEW ROUTE: Upload course materials (PDFs/PPTs)
app.post('/api/courses/:courseId/upload', upload.single('file'), async (req, res) => {
  try {
    const { courseId } = req.params;
    
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    const { originalname, filename } = req.file;
    
    const ext = path.extname(originalname).toLowerCase();
    let fileType = 'other';
    if (ext === '.pdf') {
        fileType = 'pdf';
    } else if (ext === '.ppt' || ext === '.pptx') {
        fileType = 'ppt';
    }

    const CourseModel = mongoose.model('Course'); // Get the model instance
    const course = await CourseModel.findById(courseId);
    if (!course) {
      fs.unlinkSync(req.file.path); 
      return res.status(404).json({ message: 'Course not found' });
    }

    const newMaterial = {
      originalName: originalname,
      fileName: filename,
      filePath: `/uploads/${filename}`, 
      fileType: fileType,
      uploadedAt: new Date()
    };

    course.materials.push(newMaterial);
    await course.save();

    res.status(200).json({ message: 'File uploaded successfully!', material: newMaterial });

  } catch (err) {
    console.error('File upload error:', err);
    if (req.file) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error during file upload', error: err.message });
  }
});

// NEW ROUTE: Delete course material (EDIT functionality via deletion and re-upload)
app.delete('/api/courses/:courseId/materials/:materialId', async (req, res) => {
  try {
    const { courseId, materialId } = req.params;

    const CourseModel = mongoose.model('Course'); // Get the model instance
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const materialIndex = course.materials.findIndex(m => m._id.toString() === materialId);
    if (materialIndex === -1) {
      return res.status(404).json({ message: 'Material not found in course' });
    }

    const materialToDelete = course.materials[materialIndex];
    
    // 1. Remove file from disk
    const fullPath = path.join(__dirname, 'uploads', materialToDelete.fileName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // 2. Remove entry from database array
    course.materials.splice(materialIndex, 1);
    await course.save();

    res.status(200).json({ message: 'Material deleted successfully!' });

  } catch (err) {
    console.error('Error deleting material:', err);
    res.status(500).json({ message: 'Server error deleting material', error: err.message });
  }
});


// --- LESSON ROUTES ---

// Get all lessons for a course
app.get('/api/courses/:courseId/lessons', async (req, res) => {
  try {
    const { courseId } = req.params;
    const CourseModel = mongoose.model('Course');
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // For now, store lessons inline. In production, use a separate Lesson model
    const lessons = course.lessons || [];
    res.json({ lessons });
  } catch (err) {
    console.error('Error fetching lessons:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a new lesson to a course
app.post('/api/courses/:courseId/lessons', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, order } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const CourseModel = mongoose.model('Course');
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const newLesson = {
      _id: new mongoose.Types.ObjectId(),
      title,
      content,
      order: order || (course.lessons?.length || 0) + 1,
      createdAt: new Date()
    };

    if (!course.lessons) {
      course.lessons = [];
    }
    course.lessons.push(newLesson);
    await course.save();

    res.status(201).json({ message: 'Lesson added successfully!', lesson: newLesson });
  } catch (err) {
    console.error('Error adding lesson:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a lesson from a course
app.delete('/api/courses/:courseId/lessons/:lessonId', async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const CourseModel = mongoose.model('Course');
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lessonIndex = course.lessons?.findIndex(l => l._id.toString() === lessonId);
    if (lessonIndex === -1 || lessonIndex === undefined) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    course.lessons.splice(lessonIndex, 1);
    await course.save();

    res.json({ message: 'Lesson deleted successfully!' });
  } catch (err) {
    console.error('Error deleting lesson:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// --- ASSIGNMENT ROUTES ---

// Get all assignments for a course
app.get('/api/courses/:courseId/assignments', async (req, res) => {
  try {
    const { courseId } = req.params;
    const CourseModel = mongoose.model('Course');
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const assignments = course.assignments || [];
    res.json({ assignments });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a new assignment to a course
app.post('/api/courses/:courseId/assignments', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, dueDate, maxScore } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const CourseModel = mongoose.model('Course');
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const newAssignment = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      dueDate: dueDate || null,
      maxScore: maxScore || 100,
      createdAt: new Date()
    };

    if (!course.assignments) {
      course.assignments = [];
    }
    course.assignments.push(newAssignment);
    await course.save();

    res.status(201).json({ message: 'Assignment added successfully!', assignment: newAssignment });
  } catch (err) {
    console.error('Error adding assignment:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete an assignment from a course
app.delete('/api/courses/:courseId/assignments/:assignmentId', async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;
    const CourseModel = mongoose.model('Course');
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const assignmentIndex = course.assignments?.findIndex(a => a._id.toString() === assignmentId);
    if (assignmentIndex === -1 || assignmentIndex === undefined) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    course.assignments.splice(assignmentIndex, 1);
    await course.save();

    res.json({ message: 'Assignment deleted successfully!' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// --- SEED/POPULATE COURSE WITH EXAMPLE CONTENT ---
app.post('/api/courses/:courseId/populate-content', async (req, res) => {
  try {
    const { courseId } = req.params;
    const CourseModel = mongoose.model('Course');
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const courseTitle = course.title.toLowerCase();
    let sampleLessons = [];
    let sampleAssignments = [];

    // Python Course Content
    if (courseTitle.includes('python')) {
      sampleLessons = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Introduction to Python',
          content: `Python is a high-level, interpreted programming language known for its simplicity and readability.

Key Features:
• Easy to learn and use
• Large standard library
• Cross-platform compatibility
• Supports multiple programming paradigms

Example:
print("Hello, World!")

Python is widely used in web development, data science, artificial intelligence, and automation.`,
          order: 1,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Variables and Data Types',
          content: `Variables in Python are containers for storing data values.

Basic Data Types:
• int: Integer numbers (5, -3, 100)
• float: Decimal numbers (3.14, -0.5)
• str: Text/strings ("Hello", 'Python')
• bool: Boolean (True, False)

Examples:
name = "John"
age = 25
height = 5.9
is_student = True

Python is dynamically typed - you don't need to declare variable types explicitly.`,
          order: 2,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Control Structures - If/Else',
          content: `Control structures allow you to control the flow of your program.

If Statement Syntax:
if condition:
    # code to execute
elif another_condition:
    # code to execute
else:
    # code to execute

Example:
age = 18
if age >= 18:
    print("You are an adult")
else:
    print("You are a minor")

Comparison Operators:
• == (equal to)
• != (not equal to)
• > (greater than)
• < (less than)
• >= (greater than or equal to)
• <= (less than or equal to)`,
          order: 3,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Loops - For and While',
          content: `Loops are used to execute a block of code repeatedly.

For Loop:
for i in range(5):
    print(i)  # Prints 0 to 4

While Loop:
count = 0
while count < 5:
    print(count)
    count += 1

Iterating over a list:
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

Loop Control:
• break: Exit the loop
• continue: Skip to next iteration
• pass: Do nothing (placeholder)`,
          order: 4,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Functions in Python',
          content: `Functions are reusable blocks of code that perform specific tasks.

Defining a Function:
def greet(name):
    return f"Hello, {name}!"

Calling a Function:
message = greet("Alice")
print(message)  # Output: Hello, Alice!

Function with Multiple Parameters:
def add_numbers(a, b):
    return a + b

result = add_numbers(5, 3)
print(result)  # Output: 8

Default Parameters:
def greet(name="Guest"):
    return f"Hello, {name}!"

Functions help organize code and promote reusability.`,
          order: 5,
          createdAt: new Date()
        }
      ];

      sampleAssignments = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Python Basics Quiz',
          description: 'Answer questions on Python syntax, variables, and data types. Topics include: variable declaration, type conversion, basic operators, and print statements.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          maxScore: 100,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Control Flow Assignment',
          description: 'Write a Python program that uses if-else statements and loops. Create a program that checks if a number is prime and prints all prime numbers between 1 and 100.',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          maxScore: 150,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Functions Practice',
          description: 'Create at least 5 different functions: 1) Calculator (add, subtract, multiply, divide), 2) Temperature converter, 3) Even/odd checker, 4) Factorial calculator, 5) String reverser',
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
          maxScore: 200,
          createdAt: new Date()
        }
      ];
    }
    // Full Stack Development Course Content
    else if (courseTitle.includes('full stack') || courseTitle.includes('fullstack') || courseTitle.includes('web development')) {
      sampleLessons = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Introduction to Full Stack Development',
          content: `Full Stack Development involves working on both frontend (client-side) and backend (server-side) of web applications.

Frontend Technologies:
• HTML: Structure
• CSS: Styling
• JavaScript: Interactivity
• React, Vue, Angular: Frameworks

Backend Technologies:
• Node.js, Python, Java: Server languages
• Express, Django, Spring: Frameworks
• MongoDB, MySQL, PostgreSQL: Databases

A Full Stack Developer can build complete web applications from start to finish.`,
          order: 1,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'HTML Fundamentals',
          content: `HTML (HyperText Markup Language) provides the structure of web pages.

Basic HTML Structure:
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Welcome</h1>
    <p>This is a paragraph</p>
</body>
</html>

Common Tags:
• <h1> to <h6>: Headings
• <p>: Paragraph
• <a href="">: Links
• <img src="">: Images
• <div>: Container
• <ul>, <ol>, <li>: Lists

HTML5 introduced semantic elements like <header>, <nav>, <article>, <footer>.`,
          order: 2,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'CSS Styling Basics',
          content: `CSS (Cascading Style Sheets) controls the presentation of HTML elements.

CSS Syntax:
selector {
    property: value;
}

Example:
h1 {
    color: blue;
    font-size: 24px;
    text-align: center;
}

CSS Selectors:
• Element: h1, p, div
• Class: .classname
• ID: #idname
• Attribute: [type="text"]

Box Model:
• margin: Space outside border
• border: Element border
• padding: Space inside border
• content: Actual content

Flexbox and Grid are modern layout systems.`,
          order: 3,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'JavaScript Basics',
          content: `JavaScript adds interactivity to web pages.

Variables:
let name = "John";
const age = 25;
var city = "NYC"; // old way

Functions:
function greet(name) {
    return \`Hello, \${name}!\`;
}

DOM Manipulation:
document.getElementById("myId").innerHTML = "New text";
document.querySelector(".myClass").style.color = "red";

Event Listeners:
document.getElementById("btn").addEventListener("click", function() {
    alert("Button clicked!");
});

Modern JavaScript includes ES6+ features like arrow functions, template literals, destructuring.`,
          order: 4,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Introduction to Node.js and Express',
          content: `Node.js allows JavaScript to run on the server side.

Creating a Simple Server:
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

Key Concepts:
• Routing: Define URL endpoints
• Middleware: Functions that process requests
• npm: Package manager
• REST APIs: Creating web services

Node.js is event-driven and non-blocking, making it efficient for I/O operations.`,
          order: 5,
          createdAt: new Date()
        }
      ];

      sampleAssignments = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Build a Personal Portfolio Website',
          description: 'Create a responsive portfolio website using HTML, CSS, and JavaScript. Include: Home section, About section, Projects showcase, Contact form. Use CSS Flexbox or Grid for layout.',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          maxScore: 200,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'JavaScript DOM Manipulation Project',
          description: 'Build a To-Do List application with: Add task, Delete task, Mark as complete, Filter (All/Active/Completed). Use vanilla JavaScript - no frameworks.',
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          maxScore: 150,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'REST API Development',
          description: 'Create a RESTful API using Node.js and Express with CRUD operations for a resource (books, users, products, etc.). Include: GET all, GET by ID, POST, PUT, DELETE endpoints.',
          dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          maxScore: 250,
          createdAt: new Date()
        }
      ];
    }
    // PowerBI Course Content
    else if (courseTitle.includes('power') && courseTitle.includes('bi')) {
      sampleLessons = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Introduction to Power BI',
          content: `Power BI is a business analytics service by Microsoft that provides interactive visualizations and business intelligence capabilities.

Key Components:
• Power BI Desktop: Create reports
• Power BI Service: Cloud-based platform
• Power BI Mobile: Mobile apps

Core Capabilities:
• Data Connection: Connect to 100+ data sources
• Data Transformation: Clean and shape data
• Data Modeling: Create relationships
• Visualizations: Interactive charts and graphs
• Sharing: Publish and collaborate

Power BI helps turn data into insights for better decision-making.`,
          order: 1,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Connecting to Data Sources',
          content: `Power BI can connect to various data sources.

Common Data Sources:
• Excel files (.xlsx, .csv)
• SQL Server databases
• Azure services
• Web APIs
• SharePoint lists
• Google Analytics

Steps to Connect:
1. Click 'Get Data' in Home ribbon
2. Select your data source
3. Enter credentials if needed
4. Select tables/data
5. Click 'Load' or 'Transform Data'

Power Query Editor allows you to clean and transform data before loading.`,
          order: 2,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Creating Visualizations',
          content: `Visualizations help communicate data insights effectively.

Common Visualization Types:
• Bar/Column Charts: Compare values
• Line Charts: Show trends over time
• Pie Charts: Show proportions
• Tables/Matrix: Display detailed data
• Cards: Show single values/KPIs
• Maps: Geographic data
• Slicers: Filter data interactively

Best Practices:
• Choose the right chart for your data
• Use clear titles and labels
• Limit colors for clarity
• Keep it simple and focused
• Use consistent formatting

Custom visuals available from AppSource marketplace.`,
          order: 3,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'DAX Basics - Calculated Columns and Measures',
          content: `DAX (Data Analysis Expressions) is the formula language in Power BI.

Calculated Columns:
Total Sales = Sales[Quantity] * Sales[Price]

Measures (Dynamic Calculations):
Total Revenue = SUM(Sales[Amount])
Average Sales = AVERAGE(Sales[Amount])

Common DAX Functions:
• SUM, AVERAGE, MIN, MAX
• COUNT, DISTINCTCOUNT
• CALCULATE: Modify filter context
• FILTER: Return filtered table
• RELATED: Get related values

Example Measure:
YTD Sales = TOTALYTD(SUM(Sales[Amount]), Calendar[Date])

Measures are calculated on-the-fly based on filter context.`,
          order: 4,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Publishing and Sharing Reports',
          content: `Share your Power BI reports with others.

Publishing Process:
1. Save your .pbix file
2. Click 'Publish' in Home ribbon
3. Select workspace (My Workspace or shared)
4. Report uploads to Power BI Service

Sharing Options:
• Share link: Direct access
• Embed: Integrate in websites/apps
• Export: PDF or PowerPoint
• Publish to web: Public access
• Apps: Package related content

Security:
• Row-Level Security (RLS)
• Workspace roles (Admin, Member, Contributor, Viewer)
• Sensitivity labels

Scheduled Refresh: Keep data up-to-date automatically.`,
          order: 5,
          createdAt: new Date()
        }
      ];

      sampleAssignments = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Sales Dashboard Project',
          description: 'Create an interactive sales dashboard with: Total revenue card, Sales by region (map), Top products (bar chart), Monthly trend (line chart), Category breakdown (pie chart). Include slicers for date and product category.',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          maxScore: 200,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'DAX Calculations Exercise',
          description: 'Create the following DAX measures: 1) Year-to-Date Sales, 2) Previous Year Sales, 3) Sales Growth %, 4) Top 10 Products by Revenue, 5) Customer Count. Document each formula with comments.',
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          maxScore: 150,
          createdAt: new Date()
        }
      ];
    }
    // Default generic course content
    else {
      sampleLessons = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Course Introduction and Overview',
          content: `Welcome to ${course.title}!

In this course, you will learn the fundamental concepts and practical skills needed to master this subject.

Course Objectives:
• Understand core concepts and terminology
• Apply theoretical knowledge to practical scenarios
• Develop hands-on skills through exercises
• Complete projects demonstrating proficiency

Learning Approach:
• Interactive lessons with examples
• Practice assignments
• Quizzes and assessments
• Final project

We're excited to have you on this learning journey!`,
          order: 1,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Fundamental Concepts',
          content: `This lesson covers the basic building blocks you need to understand.

Key Topics:
• Definition and importance of core concepts
• Historical context and evolution
• Current industry applications
• Best practices and standards

Understanding these fundamentals will provide a strong foundation for advanced topics covered later in the course.

Make sure to review the additional resources provided in the course materials section.`,
          order: 2,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Practical Applications',
          content: `Now let's apply what we've learned to real-world scenarios.

In this lesson:
• Step-by-step walkthroughs
• Common use cases
• Industry examples
• Hands-on exercises

Practice is essential for mastery. Work through each example carefully and don't hesitate to experiment on your own.

Remember: Making mistakes is part of the learning process!`,
          order: 3,
          createdAt: new Date()
        }
      ];

      sampleAssignments = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Concept Review Quiz',
          description: 'Complete a comprehensive quiz covering all fundamental concepts discussed in the first three lessons. Multiple choice and short answer questions included.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          maxScore: 100,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Practical Project',
          description: 'Apply the concepts learned in this course to create a practical project. Include documentation explaining your approach and implementation decisions.',
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          maxScore: 200,
          createdAt: new Date()
        }
      ];
    }

    // Add lessons and assignments to course
    course.lessons = sampleLessons;
    course.assignments = sampleAssignments;
    
    console.log(`Populating course "${course.title}" with ${sampleLessons.length} lessons and ${sampleAssignments.length} assignments`);
    console.log('Sample lesson titles:', sampleLessons.map(l => l.title));
    
    await course.save();

    res.status(200).json({ 
      message: 'Course populated with sample content successfully!', 
      lessonsAdded: sampleLessons.length,
      assignmentsAdded: sampleAssignments.length
    });
  } catch (err) {
    console.error('Error populating course content:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Basic error handler
app.use((err, req, res, next) => {
	console.error(err && err.stack ? err.stack : err);
	res.status(500).json({error: 'internal_server_error'});
});

app.listen(PORT, () => {
	console.log(`LMS backend listening on port ${PORT}`);
});

module.exports = app;
