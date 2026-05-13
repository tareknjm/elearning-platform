import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import CoursesPage from './pages/public/CoursesPage';
import CourseDetailPage from './pages/public/CourseDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import UsersPage from './pages/admin/UsersPage';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCoursePage from './pages/instructor/CreateCoursePage';
import UploadVideoPage from './pages/instructor/UploadVideoPage';
import LearnerDashboard from './pages/learner/LearnerDashboard';
import WatchCoursePage from './pages/learner/WatchCoursePage';
import PrivateRoute from './routes/PrivateRoute';
import ChatbotPage from './pages/public/ChatbotPage';
import QuizPage from './pages/learner/QuizPage';
import CreateQuizPage from './pages/instructor/CreateQuizPage';
import AnalyticsPage from './pages/instructor/AnalyticsPage';
import BecomeInstructorPage from './pages/public/BecomeInstructorPage';
import ApplicationsPage from './pages/admin/ApplicationsPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute roles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/courses" element={
          <PrivateRoute roles={['ADMIN']}><AdminCoursesPage /></PrivateRoute>} />
        <Route path="/admin/users" element={
          <PrivateRoute roles={['ADMIN']}><UsersPage /></PrivateRoute>} />

        {/* Instructor */}
        <Route path="/instructor/dashboard" element={
          <PrivateRoute roles={['INSTRUCTOR']}><InstructorDashboard /></PrivateRoute>} />
        <Route path="/instructor/courses" element={
          <PrivateRoute roles={['INSTRUCTOR']}><InstructorDashboard /></PrivateRoute>} />
        <Route path="/instructor/create-course" element={
          <PrivateRoute roles={['INSTRUCTOR']}><CreateCoursePage /></PrivateRoute>} />
        <Route path="/instructor/courses/:courseId/videos" element={
          <PrivateRoute roles={['INSTRUCTOR']}><UploadVideoPage /></PrivateRoute>} />

        {/* Learner */}
        <Route path="/learner/dashboard" element={
          <PrivateRoute roles={['LEARNER']}><LearnerDashboard /></PrivateRoute>} />
        <Route path="/learner/courses/:courseId/watch" element={
          <PrivateRoute roles={['LEARNER']}><WatchCoursePage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/learner/courses/:courseId/quiz" element={
        <PrivateRoute roles={['LEARNER']}><QuizPage /></PrivateRoute>
        } />
        <Route path="/instructor/courses/:courseId/quiz" element={
          <PrivateRoute roles={['INSTRUCTOR']}><CreateQuizPage /></PrivateRoute>
        } />
        <Route path="/instructor/analytics" element={
        <PrivateRoute roles={['INSTRUCTOR']}><AnalyticsPage /></PrivateRoute>
        } />
        <Route path="/become-instructor" element={<BecomeInstructorPage />} />
        <Route path="/admin/applications" element={
          <PrivateRoute roles={['ADMIN']}><ApplicationsPage /></PrivateRoute>
        } />
        </Routes>
    </BrowserRouter>
  );
}

export default App;