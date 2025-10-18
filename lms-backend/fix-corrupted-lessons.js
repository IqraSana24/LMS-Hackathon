// Fix corrupted lessons - remove lessons without title/content
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

async function fixCorruptedLessons() {
  try {
    console.log('\n🔍 Finding courses with corrupted lessons...\n');
    
    const courses = await Course.find({});
    let fixedCount = 0;

    for (const course of courses) {
      console.log(`📚 Checking: "${course.title}"`);
      
      let needsSave = false;
      
      if (course.lessons && course.lessons.length > 0) {
        const validLessons = course.lessons.filter(lesson => {
          // Only keep lessons that have both title AND content
          return lesson.title && lesson.content;
        });

        const invalidCount = course.lessons.length - validLessons.length;

        if (invalidCount > 0) {
          console.log(`   ⚠️  Found ${invalidCount} corrupted lessons (missing title/content)`);
          console.log(`   ✅ Kept ${validLessons.length} valid lessons`);
          console.log(`   🧹 Removing corrupted lessons...`);
          
          course.lessons = validLessons;
          needsSave = true;
        } else {
          console.log(`   ✅ All ${course.lessons.length} lessons are valid`);
        }
      } else {
        console.log(`   ℹ️  No lessons`);
      }

      // Fix assignments too
      if (course.assignments && course.assignments.length > 0) {
        const validAssignments = course.assignments.filter(assignment => {
          return assignment.title && assignment.description;
        });

        const invalidAssignCount = course.assignments.length - validAssignments.length;

        if (invalidAssignCount > 0) {
          console.log(`   ⚠️  Found ${invalidAssignCount} corrupted assignments`);
          console.log(`   🧹 Removing corrupted assignments...`);
          course.assignments = validAssignments;
          needsSave = true;
        }
      }
      
      if (needsSave) {
        await course.save();
        fixedCount++;
        console.log(`   ✅ Course fixed!\n`);
      } else {
        console.log('');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Cleanup complete!`);
    console.log(`   - Courses processed: ${courses.length}`);
    console.log(`   - Courses fixed: ${fixedCount}`);
    console.log('='.repeat(60));
    console.log('\n📝 Next steps:');
    console.log('   1. Refresh your frontend (F5)');
    console.log('   2. Click "Auto-Fill with Example Content"');
    console.log('   3. New lessons will be created correctly!');
    console.log('   4. Then click "View Lessons" button\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.\n');
  }
}

fixCorruptedLessons();
