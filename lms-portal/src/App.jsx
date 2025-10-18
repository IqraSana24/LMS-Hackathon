import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage'; // Staff/Admin/Teacher Login
import StudentLoginPage from './components/StudentLoginPage'; // Student Login
import RegistrationForm from './components/RegistrationForm';
import CreateCourse from './components/CreateCourse'; 
import TeacherDashboard from './components/TeacherDashboard'; // The new teacher homepage
import TeacherProfile from './components/TeacherProfile'; // Teacher Profile Page
import StudentDashboard from './components/StudentDashboard'; // The new student homepage
import StudentProfile from './components/StudentProfile'; // Student Profile Page
import ManageCourseContent from './components/ManageCourseContent'; // NEW IMPORT
import ViewStudentCourseContent from './components/ViewStudentCourseContent'; // NEW IMPORT
import StudentCourseView from './components/StudentCourseView'; // Student course details view
import LessonViewer from './components/LessonViewer'; // Lesson viewer component

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Entry Points */}
        <Route path="/" element={<LoginPage />} /> 
        
        {/* FIX: Student Login Route - Added path /login/student */}
        <Route path="/login/student" element={<StudentLoginPage />} /> 
        {/* Keeping the old /student-login route as well for safety */}
        <Route path="/student-login" element={<StudentLoginPage />} /> 

        <Route path="/register" element={<RegistrationForm />} />
        
        {/* Dashboard and Teacher Tools */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} /> 
        <Route path="/teacher-profile" element={<TeacherProfile />} /> 
        <Route path="/create-course" element={<CreateCourse />} /> 
        <Route path="/student-dashboard" element={<StudentDashboard />} /> 
        <Route path="/student-profile" element={<StudentProfile />} /> 
        
        {/* NEW ROUTE: Teacher content management page */}
        <Route path="/teacher/manage-course/:courseId" element={<ManageCourseContent />} />
        {/* NEW ROUTE: Student view content page */}
        <Route path="/student/course-content/:courseId" element={<ViewStudentCourseContent />} />
        {/* NEW ROUTE: Student enrolled course details view */}
        <Route path="/student/course/:courseId" element={<StudentCourseView />} />
        {/* NEW ROUTE: Lesson viewer for learning */}
        <Route path="/lessons/:courseId" element={<LessonViewer />} />

        {/* Optional: Add a general redirect for the old /dashboard path to avoid empty pages */}
        {/* <Route path="/dashboard" element={<TeacherDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
