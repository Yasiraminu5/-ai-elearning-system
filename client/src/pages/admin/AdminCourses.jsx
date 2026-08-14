import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses';
import CourseCard from '../../components/CourseCard';
import Modal from '../../components/Modal';

const EMPTY_FORM = { title:'', description:'', category:'', difficultyLevel:'beginner', isPublished:false };

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await getAllCourses();
      setCourses(data.courses || []);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      title:           course.title,
      description:     course.description,
      category:        course.category,
      difficultyLevel: course.difficultyLevel,
      isPublished:     course.isPublished,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateCourse(editing._id, form);
        toast.success('Course updated successfully');
      } else {
        await createCourse(form);
        toast.success('Course created successfully');
      }
      setModalOpen(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch {
      toast.error('Failed to delete course');
    }
  };

  if (loading) return <div className="loading-screen">Loading courses...</div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 className="section-title" style={{ margin:0 }}>Course Management</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses yet</h3>
          <p>Click "New Course" to create your first course.</p>
        </div>
      ) : (
        <div className="card-grid">
          {courses.map(course => (
            <CourseCard
              key={course._id}
              course={course}
              isAdmin={true}
              onView={(id) => navigate(`/admin/courses/${id}`)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Course' : 'Create New Course'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input type="text" value={form.title} placeholder="Course title"
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea value={form.description} placeholder="Course description"
              rows={4} style={{ width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.95rem', resize:'vertical' }}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <input type="text" value={form.category} placeholder="e.g. Programming, Mathematics"
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Difficulty Level</label>
            <select value={form.difficultyLevel}
              onChange={e => setForm(p => ({ ...p, difficultyLevel: e.target.value }))}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <input type="checkbox" id="isPublished" checked={form.isPublished}
              onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))}
              style={{ width:'auto' }} />
            <label htmlFor="isPublished" style={{ margin:0 }}>Publish this course (visible to students)</label>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex:1 }}>
              {saving ? 'Saving...' : editing ? 'Update Course' : 'Create Course'}
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

export default AdminCourses;
