import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyResults } from '../../api/quizzes';
import DashboardLayout from '../../layouts/DashboardLayout';

const StudentResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyResults().then(({ data }) => {
      setResults(data.results || []);
    }).catch(() => {
      toast.error('Failed to load results');
    }).finally(() => setLoading(false));
  }, []);

  const avgScore = results.length
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  const passed = results.filter(r => r.passed).length;

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="dashboard-welcome">
        <h2>My Quiz Results</h2>
        <p>Track your performance across all quizzes.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom:'2rem' }}>
        <div className="stat-card">
          <h3>Total Attempts</h3>
          <div className="stat-number">{results.length}</div>
        </div>
        <div className="stat-card">
          <h3>Average Score</h3>
          <div className="stat-number">{avgScore}%</div>
        </div>
        <div className="stat-card">
          <h3>Passed</h3>
          <div className="stat-number">{passed}</div>
        </div>
        <div className="stat-card">
          <h3>Failed</h3>
          <div className="stat-number">{results.length - passed}</div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <h3>No quiz results yet</h3>
          <p>Enroll in a course and take a quiz to see your results here.</p>
          <button className="btn btn-primary btn-sm"
            style={{ marginTop:'1rem' }} onClick={() => navigate('/student/courses')}>
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Course</th>
                <th>Score</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight:500 }}>{r.quizId?.title || 'N/A'}</td>
                  <td>{r.courseId?.title || 'N/A'}</td>
                  <td>
                    <span style={{ fontWeight:600, color: r.score >= 70 ? '#276749' : r.score >= 50 ? '#c05621' : '#c53030' }}>
                      {r.score}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.passed ? 'badge-green' : 'badge-red'}`}>
                      {r.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td style={{ fontSize:'0.85rem', color:'#888' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
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

export default StudentResults;
