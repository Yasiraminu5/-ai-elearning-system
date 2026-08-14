import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCourse, updateCourse } from '../../api/courses';
import { getLessons, createLesson, updateLesson, deleteLesson } from '../../api/courses';
import Modal from '../../components/Modal';

const EMPTY_LESSON = { title:'', content:'', videoUrl:'', order:1, duration:0 };

const AdminCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse]   = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [form, setForm] = useState(EMPTY_LESSON);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const { data } = await getCourse(id);
      setCourse(data.course);
      setLessons(data.lessons || []);
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const openCreateLesson = () => {
    setEditingLesson(null);
    setForm({ ...EMPTY_LESSON, order: lessons.length + 1 });
    setModalOpen(true);
  };

  const openEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setForm({
      title:    lesson.title,
      content:  lesson.content,
      videoUrl: lesson.videoUrl || '',
      order:    lesson.order,
      duration: lesson.duration || 0,
    });
    setModalOpen(true);
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      if (editingLesson) {
        await updateLesson(editingLesson._id, form);
        toast.success('Lesson updated');
      } else {
        await createLesson(id, form);
        toast.success('Lesson created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await deleteLesson(lessonId);
      toast.success('Lesson deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete lesson');
    }
  };

  const togglePublish = async () => {
    try {
      await updateCourse(id, { isPublished: !course.isPublished });
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published');
      fetchData();
    } catch {
      toast.error('Failed to update course');
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!course)  return <div className="empty-state"><h3>Course not found</h3></div>;

  return (
    <div>
      <button onClick={() => navigate('/admin/dashboard')}
        style={{ background:'none', border:'none', color:'#667eea', cursor:'pointer', marginBottom:'1rem', fontSize:'0.9rem' }}>
        ← Back to Dashboard
      </button>

      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'0.5rem' }}>{course.title}</h2>
            <p style={{ color:'#666', marginBottom:'0.5rem' }}>{course.description}</p>
            <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
              <span className="badge badge-blue">{course.category}</span>
              <span className="badge badge-purple">{course.difficultyLevel}</span>
              <span className={`badge ${course.isPublished ? 'badge-green' : 'badge-red'}`}>
                {course.isPublished ? 'Published' : 'Unpublished'}
              </span>
            </div>
          </div>
          <button
            className={`btn btn-sm ${course.isPublished ? 'btn-danger' : 'btn-primary'}`}
            onClick={togglePublish}>
            {course.isPublished ? 'Unpublish' : 'Publish Course'}
          </button>
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <h3 className="section-title" style={{ margin:0 }}>
          Lessons ({lessons.length})
        </h3>
        <button className="btn btn-primary btn-sm" onClick={openCreateLesson}>
          + Add Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="empty-state">
          <h3>No lessons yet</h3>
          <p>Click "Add Lesson" to create the first lesson for this course.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {lessons.map((lesson, index) => (
            <div key={lesson._id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:600, color:'#222' }}>
                  {index + 1}. {lesson.title}
                </div>
                <div style={{ fontSize:'0.8rem', color:'#888', marginTop:'0.25rem' }}>
                  {lesson.content?.substring(0, 80)}...
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEditLesson(lesson)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLesson(lesson._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
      >
        <form onSubmit={handleLessonSubmit}>
          <div className="form-group">
            <label>Lesson Title *</label>
            <input type="text" value={form.title} placeholder="Lesson title"
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Content *</label>
            <textarea value={form.content} placeholder="Lesson content..."
              rows={6} style={{ width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.95rem', resize:'vertical' }}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Video URL (optional)</label>
            <input type="text" value={form.videoUrl} placeholder="https://youtube.com/..."
              onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))} />
          </div>
          <div style={{ display:'flex', gap:'1rem' }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Order</label>
              <input type="number" value={form.order} min={1}
                onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Duration (minutes)</label>
              <input type="number" value={form.duration} min={0}
                onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex:1 }}>
              {saving ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Add Lesson'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} style={{ flex:1 }}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCourseDetail;
