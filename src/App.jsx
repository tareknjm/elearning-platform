import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import CoursesPage from './pages/public/CoursesPage';
import CourseDetailPage from './pages/public/CourseDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminVideosPage from './pages/admin/AdminVideosPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import UsersPage from './pages/admin/UsersPage';
import AdminCategoryRequestsPage from './pages/admin/AdminCategoryRequestsPage';
import InstructorAbsencePage from './pages/instructor/InstructorAbsencePage';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCoursePage from './pages/instructor/CreateCoursePage';
import UploadVideoPage from './pages/instructor/UploadVideoPage';
import LearnerDashboard from './pages/learner/LearnerDashboard';
import WatchCoursePage from './pages/learner/WatchCoursePage';
import PrivateRoute from './routes/PrivateRoute';
import AdminAbsencesPage from './pages/admin/AdminAbsencesPage';
import AdminPenaltiesPage from './pages/admin/AdminPenaltiesPage';
import ChatbotPage from './pages/public/ChatbotPage';
import QuizPage from './pages/learner/QuizPage';
import CreateQuizPage from './pages/instructor/CreateQuizPage';
import AnalyticsPage from './pages/instructor/AnalyticsPage';
import BecomeInstructorPage from './pages/public/BecomeInstructorPage';
import ApplicationsPage from './pages/admin/ApplicationsPage';
import PricingPage from './pages/public/PricingPage';
import PaymentPage from './pages/learner/PaymentPage';

// Nouveau système d'appels vidéo 1-on-1
import InstructorAvailabilityPage from './pages/instructor/InstructorAvailabilityPage';
import MyVideoCallsPage from './pages/shared/MyVideoCallsPage';
import VideoCallRoomPage from './pages/shared/VideoCallRoomPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/learner/payment" element={
          <PrivateRoute roles={['LEARNER']}><PaymentPage /></PrivateRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<PrivateRoute roles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/courses" element={<PrivateRoute roles={['ADMIN']}><AdminCoursesPage /></PrivateRoute>} />
        <Route path="/admin/videos" element={<PrivateRoute roles={['ADMIN']}><AdminVideosPage /></PrivateRoute>} />
        <Route path="/admin/categories" element={<PrivateRoute roles={['ADMIN']}><AdminCategoriesPage /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute roles={['ADMIN']}><UsersPage /></PrivateRoute>} />
        <Route path="/admin/category-requests" element={<PrivateRoute roles={['ADMIN']}><AdminCategoryRequestsPage /></PrivateRoute>} />
        <Route path="/admin/applications" element={<PrivateRoute roles={['ADMIN']}><ApplicationsPage /></PrivateRoute>} />
        <Route path="/admin/absences" element={<PrivateRoute roles={['ADMIN']}><AdminAbsencesPage /></PrivateRoute>} />
        <Route path="/admin/penalties" element={<PrivateRoute roles={['ADMIN']}><AdminPenaltiesPage /></PrivateRoute>} />
        {/* Instructor */}
        <Route path="/instructor/dashboard" element={<PrivateRoute roles={['INSTRUCTOR']}><InstructorDashboard /></PrivateRoute>} />
        <Route path="/instructor/courses" element={<PrivateRoute roles={['INSTRUCTOR']}><InstructorDashboard /></PrivateRoute>} />
        <Route path="/instructor/create-course" element={<PrivateRoute roles={['INSTRUCTOR']}><CreateCoursePage /></PrivateRoute>} />
        <Route path="/instructor/courses/:courseId/videos" element={<PrivateRoute roles={['INSTRUCTOR']}><UploadVideoPage /></PrivateRoute>} />
        <Route path="/instructor/courses/:courseId/quiz" element={<PrivateRoute roles={['INSTRUCTOR']}><CreateQuizPage /></PrivateRoute>} />
        <Route path="/instructor/analytics" element={<PrivateRoute roles={['INSTRUCTOR']}><AnalyticsPage /></PrivateRoute>} />
        <Route path="/instructor/absences" element={<PrivateRoute roles={['INSTRUCTOR']}><InstructorAbsencePage /></PrivateRoute>} />
        <Route path="/instructor/availability" element={<PrivateRoute roles={['INSTRUCTOR']}><InstructorAvailabilityPage /></PrivateRoute>} />
        <Route path="/instructor/video-calls" element={<PrivateRoute roles={['INSTRUCTOR']}><MyVideoCallsPage /></PrivateRoute>} />

        {/* Learner */}
        <Route path="/learner/dashboard" element={<PrivateRoute roles={['LEARNER']}><LearnerDashboard /></PrivateRoute>} />
        <Route path="/learner/courses/:courseId/watch" element={<PrivateRoute roles={['LEARNER']}><WatchCoursePage /></PrivateRoute>} />
        <Route path="/learner/courses/:courseId/quiz" element={<PrivateRoute roles={['LEARNER']}><QuizPage /></PrivateRoute>} />
        <Route path="/learner/video-calls" element={<PrivateRoute roles={['LEARNER']}><MyVideoCallsPage /></PrivateRoute>} />

        <Route path="/become-instructor" element={<BecomeInstructorPage />} />

        {/* Partagé Learner/Instructor */}
        <Route path="/video-call/:bookingId" element={
          <PrivateRoute roles={['LEARNER', 'INSTRUCTOR']}><VideoCallRoomPage /></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;