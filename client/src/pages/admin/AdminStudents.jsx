import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { getAllResults } from '../../api/quizzes';
import DashboardLayout from '../../layouts/DashboardLayout';

const AdminStudents = () => {
  const [students, setStudents]   = useState([]);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, resultsRes] = await Promise.all([
        API.get('/auth/students'),
        getAllResults(),
      ]);
      setStudents(studentsRes.data.students || []);
      setResults(resultsRes.data.results || []);
    } catch {
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const getStudentAvgScore = (studentId) => {
    const studentResults = results.filter(r => r.studentId?._id === studentId);
    if (!studentResults.length) return 'N/A';
    const avg = studentResults.reduce((sum, r) => sum + r.score, 0) / studentResults.length;
    return `${Math.round(avg)}%`;
  };

  const getStudentAttempts = (studentId) =>
    results.filter(r => r.studentId?._id === studentId).length;

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="dashboard-welcome">
        <h2>Student Management</h2>
        <p>View all registered students and their performance.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom:'2rem' }}>
        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="stat-number">{students.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Quiz Attempts</h3>
          <div className="stat-number">{results.length}</div>
        </div>
        <div className="stat-card">
          <h3>Pass Rate</h3>
          <div className="stat-number">
            {results.length ? `${Math.round((results.filter(r=>r.passed).length/results.length)*100)}%` : 'N/A'}
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <h3>No students registered yet</h3>
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Interests</th>
                <th>Quiz Attempts</th>
                <th>Average Score</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id}>
                  <td style={{ fontWeight:500 }}>{student.fullName}</td>
                  <td style={{ color:'#888', fontSize:'0.875rem' }}>{student.email}</td>
                  <td>
                    {student.interests?.length > 0
                      ? student.interests.slice(0,2).map((i,idx) => (
                          <span key={idx} className="badge badge-blue" style={{ marginRight:'0.25rem', fontSize:'0.7rem' }}>{i}</span>
                        ))
                      : <span style={{ color:'#888', fontSize:'0.8rem' }}>None set</span>
                    }
                  </td>
                  <td>{getStudentAttempts(student._id)}</td>
                  <td>
                    <span style={{ fontWeight:600, color:'#667eea' }}>
                      {getStudentAvgScore(student._id)}
                    </span>
                  </td>
                  <td style={{ fontSize:'0.85rem', color:'#888' }}>
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminStudents;
