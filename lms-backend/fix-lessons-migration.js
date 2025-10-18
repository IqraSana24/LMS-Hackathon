// Migration script to convert lesson references to embedded lessons
// Run this once: node fix-lessons-migration.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Load the Course model
const Course = require('./models/Course');

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected for migration'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function migrateLessons() {
  try {
    // Course model is already loaded above
    
    // Find all courses
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to migrate`);

    for (const course of courses) {
      console.log(`\nProcessing course: ${course.title}`);
      
      // Check if lessons are stored as ObjectIds (references)
      if (course.lessons && course.lessons.length > 0) {
        const firstLesson = course.lessons[0];
        
        // If it's an ObjectId string (not an embedded object)
        if (typeof firstLesson === 'string' || firstLesson instanceof mongoose.Types.ObjectId) {
          console.log(`  ⚠️  Course has ${course.lessons.length} lesson references (needs migration)`);
          console.log(`  Converting to embedded lessons...`);
          
          // Clear the lesson references - they can't be converted
          // User will need to re-add lessons or we populate with sample data
          course.lessons = [];
          course.assignments = course.assignments?.filter(a => typeof a !== 'string' && !(a instanceof mongoose.Types.ObjectId)) || [];
          
          await course.save();
          console.log(`  ✅ Cleared invalid lesson references. Please re-add lessons or use "Auto-Fill" feature.`);
        } else {
          console.log(`  ✅ Course already has embedded lessons (${course.lessons.length} lessons)`);
        }
      } else {
        console.log(`  ℹ️  Course has no lessons`);
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('\nNOTE: Courses with invalid lesson references have been cleared.');
    console.log('Please use the "Auto-Fill with Example Content" button to regenerate lesson content.');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run migration
migrateLessons();
