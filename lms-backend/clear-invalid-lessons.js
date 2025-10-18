// Script to clear invalid lessons from all courses
// Run this: node clear-invalid-lessons.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const Course = require('./models/Course');

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected for cleanup'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function clearInvalidLessons() {
  try {
    console.log('\n🔍 Checking all courses for invalid lesson data...\n');
    
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses total\n`);

    let fixedCount = 0;

    for (const course of courses) {
      console.log(`📚 Checking: "${course.title}"`);
      
      let needsUpdate = false;
      
      // Check if lessons array contains strings (invalid)
      if (course.lessons && course.lessons.length > 0) {
        const firstLesson = course.lessons[0];
        
        if (typeof firstLesson === 'string' || firstLesson instanceof mongoose.Types.ObjectId) {
          console.log(`   ⚠️  Found ${course.lessons.length} invalid lessons (stored as IDs)`);
          console.log(`   🧹 Clearing invalid lessons...`);
          course.lessons = [];
          needsUpdate = true;
        } else if (firstLesson.title && firstLesson.content) {
          console.log(`   ✅ Has ${course.lessons.length} valid embedded lessons`);
        }
      } else {
        console.log(`   ℹ️  No lessons`);
      }
      
      // Check assignments too
      if (course.assignments && course.assignments.length > 0) {
        const firstAssignment = course.assignments[0];
        
        if (typeof firstAssignment === 'string' || firstAssignment instanceof mongoose.Types.ObjectId) {
          console.log(`   ⚠️  Found ${course.assignments.length} invalid assignments (stored as IDs)`);
          console.log(`   🧹 Clearing invalid assignments...`);
          course.assignments = [];
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await course.save();
        fixedCount++;
        console.log(`   ✅ Course updated successfully!\n`);
      } else {
        console.log('');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Cleanup complete!`);
    console.log(`   - Total courses checked: ${courses.length}`);
    console.log(`   - Courses fixed: ${fixedCount}`);
    console.log('='.repeat(60));
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Refresh your frontend');
    console.log('   3. Use "Auto-Fill with Example Content" to add lessons');
    console.log('   4. Or manually add new lessons\n');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.\n');
  }
}

clearInvalidLessons();
