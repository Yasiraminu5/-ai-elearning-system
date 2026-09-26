import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCourse, enrollCourse, getEnrolledCourses, completeLesson } from '../../api/courses';
import { getCourseQuizzes } from '../../api/quizzes';
import DiscussionForum from '../../components/DiscussionForum';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getEmbedUrl, isYouTubeUrl } from '../../utils/videoHelper';

const StudentCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse]             = useState(null);
  const [lessons, setLessons]           = useState([]);
  const [quizzes, setQuizzes]           = useState([]);
  const [enrollment, setEnrollment]     = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab]       = useState('lessons');
  const [loading, setLoading]           = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, enrolledRes, quizzesRes] = await Promise.all([
        getCourse(id),
        getEnrolledCourses(),
        getCourseQuizzes(id),
      ]);
      setCourse(courseRes.data.course);
      setLessons(courseRes.data.lessons || []);
      setQuizzes(quizzesRes.data.quizzes || []);
      const found = (enrolledRes.data.enrollments || []).find(
        e => e.courseId?._id === id
      );
      setEnrollment(found || null);
      if (courseRes.data.lessons?.length > 0) {
        setActiveLesson(courseRes.data.lessons[0]);
      }
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await enrollCourse(id);
      toast.success('Enrolled successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    try {
      const { data } = await completeLesson(lessonId);
      toast.success(`Progress: ${data.progressPercent}%`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark complete');
    }
  };

  const isLessonCompleted = (lessonId) =>
    enrollment?.completedLessons?.includes(lessonId);

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!course)  return <div className="empty-state"><h3>Course not found</h3></div>;

  return (
    <DashboardLayout>
      <button onClick={() => navigate('/student/courses')}
        style={{ background:'none', border:'none', color:'#667eea', cursor:'pointer', marginBottom:'1rem', fontSize:'0.9rem' }}>
        ← Back to Courses
      </button>

      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'0.5rem' }}>{course.title}</h2>
            <p style={{ color:'#666', marginBottom:'0.75rem' }}>{course.description}</p>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              <span className="badge badge-blue">{course.category}</span>
              <span className="badge badge-purple">{course.difficultyLevel}</span>
            </div>
          </div>
          {!enrollment ? (
            <button className="btn btn-primary btn-sm" onClick={handleEnroll}>Enroll Now</button>
          ) : (
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'0.8rem', color:'#888', marginBottom:'0.25rem' }}>Progress</div>
              <div style={{ fontSize:'1.5rem', fontWeight:700, color:'#667eea' }}>
                {enrollment.progressPercent || 0}%
              </div>
            </div>
          )}
        </div>
        {enrollment && (
          <div style={{ marginTop:'1rem' }}>
            <div style={{ background:'#e2e8f0', borderRadius:'999px', height:'8px', overflow:'hidden' }}>
              <div style={{
                background:'linear-gradient(135deg,#667eea,#764ba2)',
                width:`${enrollment.progressPercent || 0}%`,
                height:'100%', borderRadius:'999px', transition:'width 0.3s',
              }} />
            </div>
          </div>
        )}
      </div>

      <div style={{
        display:'flex', gap:'0.25rem', marginBottom:'1.5rem',
        background:'#e2e8f0', borderRadius:'10px', padding:'0.25rem',
        width:'fit-content',
      }}>
        {['lessons', 'quizzes', 'discussion'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding:'0.5rem 1.25rem', borderRadius:'8px', border:'none',
              cursor:'pointer', fontWeight:500, fontSize:'0.875rem',
              background: activeTab === tab ? '#fff' : 'transparent',
              color: activeTab === tab ? '#667eea' : '#888',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
            {tab === 'lessons' ? '📚 Lessons'
              : tab === 'quizzes' ? '📝 Quizzes'
              : '💬 Discussion'}
          </button>
        ))}
      </div>

      {activeTab === 'lessons' && (
        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'1.5rem' }}>
          <div>
            <h3 className="section-title">Lessons ({lessons.length})</h3>
            {lessons.length === 0 ? (
              <p style={{ color:'#888', fontSize:'0.875rem' }}>No lessons yet.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {lessons.map((lesson, index) => (
                  <div key={lesson._id} onClick={() => setActiveLesson(lesson)}
                    style={{
                      padding:'0.75rem 1rem', borderRadius:'8px', cursor:'pointer',
                      background: activeLesson?._id === lesson._id ? '#667eea' : '#fff',
                      color: activeLesson?._id === lesson._id ? '#fff' : '#333',
                      boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      border: activeLesson?._id === lesson._id ? 'none' : '1px solid #e2e8f0',
                    }}>
                    <span style={{ fontSize:'0.9rem', fontWeight:500 }}>
                      {index + 1}. {lesson.title}
                    </span>
                    {isLessonCompleted(lesson._id) && <span>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {activeLesson ? (
              <div className="card">
                <h3 style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:'1rem' }}>
                  {activeLesson.title}
                </h3>

                {activeLesson.videoUrl && (
                  <div style={{ marginBottom:'1.5rem' }}>
                    {isYouTubeUrl(activeLesson.videoUrl) ? (
                      <div style={{
                        position:'relative', paddingBottom:'56.25%', height:0,
                        borderRadius:'12px', overflow:'hidden', background:'#000',
                      }}>
                        <iframe
                          src={getEmbedUrl(activeLesson.videoUrl)}
                          title={activeLesson.title}
                          allowFullScreen
                          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
                        />
                      </div>
                    ) : (
                      <a href={activeLesson.videoUrl} target="_blank" rel="noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', color:'#667eea', fontWeight:500, fontSize:'0.9rem', padding:'0.5rem 1rem', background:'#ebf4ff', borderRadius:'8px' }}>
                        🎥 Watch Video
                      </a>
                    )}
                  </div>
                )}

                <div style={{ color:'#444', lineHeight:1.9, marginBottom:'1.5rem', whiteSpace:'pre-wrap', fontSize:'0.95rem' }}>
                  {activeLesson.content}
                </div>

                {enrollment && !isLessonCompleted(activeLesson._id) && (
                  <button className="btn btn-primary btn-sm"
                    onClick={() => handleCompleteLesson(activeLesson._id)}>
                    ✓ Mark as Complete
                  </button>
                )}
                {isLessonCompleted(activeLesson._id) && (
                  <span className="badge badge-green">✓ Completed</span>
                )}
              </div>
            ) : (
              <div className="empty-state"><h3>Select a lesson to begin</h3></div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div>
          {quizzes.length === 0 ? (
            <div className="empty-state">
              <h3>No quizzes available for this course yet.</h3>
            </div>
          ) : (
            <div className="card-grid">
              {quizzes.map(quiz => (
                <div key={quiz._id} className="card">
                  <h4 style={{ fontWeight:600, marginBottom:'0.5rem' }}>{quiz.title}</h4>
                  <div style={{ fontSize:'0.85rem', color:'#888', marginBottom:'0.75rem' }}>
                    🎯 Pass mark: {quiz.passMark}% &nbsp;|&nbsp;
                    📝 {quiz.questions?.length} questions &nbsp;|&nbsp;
                    ⏱ {quiz.timeLimit} min
                  </div>
                  <span className={`badge ${
                    quiz.difficultyLevel === 'easy' ? 'badge-green'
                    : quiz.difficultyLevel === 'medium' ? 'badge-blue'
                    : 'badge-purple'
                  }`} style={{ marginBottom:'1rem', display:'inline-block' }}>
                    {quiz.difficultyLevel}
                  </span>
                  <div>
                    {enrollment ? (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/student/quiz/${quiz._id}`)}>
                        Take Quiz →
                      </button>
                    ) : (
                      <p style={{ fontSize:'0.8rem', color:'#888' }}>
                        Enroll in this course to take the quiz.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'discussion' && (
        <DiscussionForum courseId={id} />
      )}

    </DashboardLayout>
  );
};

export default StudentCourseDetail;
