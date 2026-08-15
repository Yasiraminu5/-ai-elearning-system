import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import Register            from './pages/auth/Register';
import Login               from './pages/auth/Login';
import StudentDashboard    from './pages/student/StudentDashboard';
import StudentCourses      from './pages/student/StudentCourses';
import StudentCourseDetail from './pages/student/StudentCourseDetail';
import StudentQuiz         from './pages/student/StudentQuiz';
import StudentResults      from './pages/student/StudentResults';
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminCourses        from './pages/admin/AdminCourses';
import AdminCourseDetail   from './pages/admin/AdminCourseDetail';
import AdminQuizzes        from './pages/admin/AdminQuizzes';
import ProtectedRoute      from './routes/ProtectedRoute';

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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />

        {/* Student routes */}
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

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/courses" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminCourses /></ProtectedRoute>} />
        <Route path="/admin/courses/:id" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminCourseDetail /></ProtectedRoute>} />
        <Route path="/admin/quizzes" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminQuizzes /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
