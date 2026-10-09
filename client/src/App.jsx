import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import Landing                 from './pages/Landing';
import Register                from './pages/auth/Register';
import Login                   from './pages/auth/Login';
import StudentDashboard        from './pages/student/StudentDashboard';
import StudentCourses          from './pages/student/StudentCourses';
import StudentCourseDetail     from './pages/student/StudentCourseDetail';
import StudentQuiz             from './pages/student/StudentQuiz';
import StudentResults          from './pages/student/StudentResults';
import StudentRecommendations  from './pages/student/StudentRecommendations';
import StudentProfile          from './pages/student/StudentProfile';
import AdminDashboard          from './pages/admin/AdminDashboard';
import AdminCourses            from './pages/admin/AdminCourses';
import AdminCourseDetail       from './pages/admin/AdminCourseDetail';
import AdminQuizzes            from './pages/admin/AdminQuizzes';
import AdminStudents           from './pages/admin/AdminStudents';
import AdminReports            from './pages/admin/AdminReports';
import ProtectedRoute          from './routes/ProtectedRoute';
import NotFound                from './pages/NotFound';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={
    user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'
  } replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />

        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/courses" element={
          <ProtectedRoute allowedRoles={['student']}><StudentCourses /></ProtectedRoute>} />
        <Route path="/student/courses/:id" element={
          <ProtectedRoute allowedRoles={['student']}><StudentCourseDetail /></ProtectedRoute>} />
        <Route path="/student/quiz/:id" element={
          <ProtectedRoute allowedRoles={['student']}><StudentQuiz /></ProtectedRoute>} />
        <Route path="/student/results" element={
          <ProtectedRoute allowedRoles={['student']}><StudentResults /></ProtectedRoute>} />
        <Route path="/student/recommendations" element={
          <ProtectedRoute allowedRoles={['student']}><StudentRecommendations /></ProtectedRoute>} />
        <Route path="/student/profile" element={
          <ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/courses" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminCourses /></ProtectedRoute>} />
        <Route path="/admin/courses/:id" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminCourseDetail /></ProtectedRoute>} />
        <Route path="/admin/quizzes" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminQuizzes /></ProtectedRoute>} />
        <Route path="/admin/students" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
