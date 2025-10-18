// Inspect a specific course to see its lesson structure
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const Course = require('./models/Course');

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function inspectCourse() {
  try {
    // Get the course ID from the URL you showed: 68f26bc01d552594ddb3b2be
    const courseId = '68f26bc01d552594ddb3b2be';
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      console.log('❌ Course not found');
      return;
    }

    console.log('\n📚 Course:', course.title);
    console.log('🆔 ID:', course._id);
    console.log('\n📖 Lessons Array:');
    console.log('   Type:', typeof course.lessons);
    console.log('   Length:', course.lessons?.length || 0);
    
    if (course.lessons && course.lessons.length > 0) {
      console.log('\n   First 3 lessons:');
      course.lessons.slice(0, 3).forEach((lesson, index) => {
        console.log(`\n   Lesson ${index + 1}:`);
        console.log('      Type:', typeof lesson);
        console.log('      Value:', lesson);
        console.log('      Is ObjectId?:', lesson instanceof mongoose.Types.ObjectId);
        console.log('      Is String?:', typeof lesson === 'string');
        
        if (typeof lesson === 'object' && lesson !== null) {
          console.log('      Has _id?:', !!lesson._id);
          console.log('      Has title?:', !!lesson.title);
          console.log('      Has content?:', !!lesson.content);
          if (lesson.title) console.log('      Title:', lesson.title);
        }
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.\n');
  }
}

inspectCourse();
