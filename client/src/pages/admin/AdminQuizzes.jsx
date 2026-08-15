import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllCourses } from '../../api/courses';
import { getQuizzes, createQuiz, deleteQuiz } from '../../api/quizzes';
import Modal from '../../components/Modal';

const EMPTY_FORM = {
  courseId: '', title: '', passMark: 60,
  difficultyLevel: 'medium', timeLimit: 30, questions: [],
};

const EMPTY_Q = { questionText: '', options: ['', '', '', ''], correctAnswer: 0 };

const AdminQuizzes = () => {
  const [quizzes, setQuizzes]   = useState([]);
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [qRes, cRes] = await Promise.all([getQuizzes(), getAllCourses()]);
      setQuizzes(qRes.data.quizzes || []);
      setCourses(cRes.data.courses || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setForm(p => ({ ...p, questions: [...p.questions, { ...EMPTY_Q, options: ['','','',''] }] }));
  };

  const removeQuestion = (index) => {
    setForm(p => ({ ...p, questions: p.questions.filter((_, i) => i !== index) }));
  };

  const updateQuestion = (index, field, value) => {
    setForm(p => {
      const questions = [...p.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...p, questions };
    });
  };

  const updateOption = (qIndex, oIndex, value) => {
    setForm(p => {
      const questions = [...p.questions];
      const options   = [...questions[qIndex].options];
      options[oIndex] = value;
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...p, questions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId || !form.title) {
      toast.error('Course and title are required'); return;
    }
    if (form.questions.length === 0) {
      toast.error('Add at least one question'); return;
    }
    for (const q of form.questions) {
      if (!q.questionText.trim()) { toast.error('All questions need text'); return; }
      if (q.options.some(o => !o.trim())) { toast.error('All options must be filled'); return; }
    }
    setSaving(true);
    try {
      await createQuiz(form);
      toast.success('Quiz created successfully');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      toast.success('Quiz deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete quiz');
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 className="section-title" style={{ margin:0 }}>Quiz Management</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}>
          + New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <h3>No quizzes yet</h3>
          <p>Create your first quiz by clicking "New Quiz".</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Questions</th>
                <th>Pass Mark</th>
                <th>Difficulty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr key={quiz._id}>
                  <td style={{ fontWeight:500 }}>{quiz.title}</td>
                  <td>{quiz.courseId?.title || 'N/A'}</td>
                  <td>{quiz.questions?.length || 0}</td>
                  <td>{quiz.passMark}%</td>
                  <td><span className="badge badge-blue">{quiz.difficultyLevel}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(quiz._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Quiz">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course *</label>
            <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
              <option value="">Select a course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Quiz Title *</label>
            <input type="text" value={form.title} placeholder="Quiz title"
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div style={{ display:'flex', gap:'1rem' }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Pass Mark (%)</label>
              <input type="number" value={form.passMark} min={0} max={100}
                onChange={e => setForm(p => ({ ...p, passMark: Number(e.target.value) }))} />
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Difficulty</label>
              <select value={form.difficultyLevel}
                onChange={e => setForm(p => ({ ...p, difficultyLevel: e.target.value }))}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Time Limit (min)</label>
              <input type="number" value={form.timeLimit} min={1}
                onChange={e => setForm(p => ({ ...p, timeLimit: Number(e.target.value) }))} />
            </div>
          </div>

          <div style={{ marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
              <label style={{ fontWeight:600 }}>Questions ({form.questions.length})</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>
                + Add Question
              </button>
            </div>

            {form.questions.map((q, qi) => (
              <div key={qi} style={{ background:'#f7fafc', borderRadius:'8px', padding:'1rem', marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                  <label style={{ fontWeight:500 }}>Question {qi + 1}</label>
                  <button type="button" onClick={() => removeQuestion(qi)}
                    style={{ background:'none', border:'none', color:'#e53e3e', cursor:'pointer', fontSize:'1.2rem' }}>×</button>
                </div>
                <input type="text" value={q.questionText} placeholder="Question text"
                  style={{ width:'100%', padding:'0.6rem', borderRadius:'6px', border:'1.5px solid #e2e8f0', marginBottom:'0.5rem', fontSize:'0.9rem' }}
                  onChange={e => updateQuestion(qi, 'questionText', e.target.value)} />
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                    <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi}
                      onChange={() => updateQuestion(qi, 'correctAnswer', oi)} />
                    <input type="text" value={opt} placeholder={`Option ${oi + 1}`}
                      style={{ flex:1, padding:'0.5rem', borderRadius:'6px', border:'1.5px solid #e2e8f0', fontSize:'0.875rem' }}
                      onChange={e => updateOption(qi, oi, e.target.value)} />
                  </div>
                ))}
                <p style={{ fontSize:'0.75rem', color:'#888', marginTop:'0.25rem' }}>
                  Select the radio button next to the correct answer
                </p>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex:1 }}>
              {saving ? 'Creating...' : 'Create Quiz'}
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

export default AdminQuizzes;
