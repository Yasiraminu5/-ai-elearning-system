import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllCourses, enrollCourse, getEnrolledCourses } from '../../api/courses';
import CourseCard from '../../components/CourseCard';

const StudentCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses]         = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, enrolledRes] = await Promise.all([
        getAllCourses(),
        getEnrolledCourses(),
      ]);
      setCourses(coursesRes.data.courses || []);
      const ids = (enrolledRes.data.enrollments || []).map(e => e.courseId?._id);
      setEnrolledIds(ids);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollCourse(courseId);
      toast.success('Enrolled successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                        c.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.difficultyLevel === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="loading-screen">Loading courses...</div>;

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 className="section-title">Browse Courses</h2>
        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'1rem' }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex:1, minWidth:'200px', padding:'0.6rem 1rem', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'0.9rem' }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding:'0.6rem 1rem', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'0.9rem' }}>
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No courses found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(course => (
            <CourseCard
              key={course._id}
              course={course}
              isAdmin={false}
              isEnrolled={enrolledIds.includes(course._id)}
              onView={(id) => navigate(`/student/courses/${id}`)}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
