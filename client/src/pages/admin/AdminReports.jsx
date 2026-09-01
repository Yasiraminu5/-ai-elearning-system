import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllResults } from '../../api/quizzes';
import { getAllCourses } from '../../api/courses';
import DashboardLayout from '../../layouts/DashboardLayout';

const AdminReports = () => {
  const [results, setResults]   = useState([]);
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [rRes, cRes] = await Promise.all([getAllResults(), getAllCourses()]);
      setResults(rRes.data.results || []);
      setCourses(cRes.data.courses || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? results
    : filter === 'passed' ? results.filter(r => r.passed)
    : results.filter(r => !r.passed);

  const avgScore = results.length
    ? Math.round(results.reduce((s,r) => s+r.score, 0) / results.length)
    : 0;

  const passRate = results.length
    ? Math.round((results.filter(r=>r.passed).length / results.length) * 100)
    : 0;

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="dashboard-welcome">
        <h2>Performance Reports</h2>
        <p>Overview of all student quiz performance across the platform.</p>
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
          <h3>Pass Rate</h3>
          <div className="stat-number">{passRate}%</div>
        </div>
        <div className="stat-card">
          <h3>Total Courses</h3>
          <div className="stat-number">{courses.length}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'1rem' }}>
          <h3 style={{ fontWeight:600, margin:0 }}>All Quiz Results</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding:'0.5rem 1rem', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'0.875rem' }}>
            <option value="all">All Results</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No results found</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Quiz</th>
                  <th>Course</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight:500 }}>{r.studentId?.fullName || 'N/A'}</td>
                    <td>{r.quizId?.title || 'N/A'}</td>
                    <td style={{ color:'#888', fontSize:'0.875rem' }}>{r.courseId?.title || 'N/A'}</td>
                    <td>
                      <span style={{ fontWeight:700, color: r.score>=70?'#276749':r.score>=50?'#c05621':'#c53030' }}>
                        {r.score}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${r.passed?'badge-green':'badge-red'}`}>
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
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
