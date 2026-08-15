import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getQuiz, submitQuiz } from '../../api/quizzes';

const StudentQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz]       = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]   = useState(null);

  useEffect(() => {
    getQuiz(id).then(({ data }) => {
      setQuiz(data.quiz);
      setAnswers(new Array(data.quiz.questions.length).fill(-1));
    }).catch(() => {
      toast.error('Failed to load quiz');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAnswer = (qIndex, oIndex) => {
    if (result) return;
    setAnswers(prev => {
      const updated = [...prev];
      updated[qIndex] = oIndex;
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (answers.includes(-1)) {
      toast.error('Please answer all questions before submitting');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await submitQuiz(id, { answers });
      setResult(data.result);
      if (data.result.passed) {
        toast.success(`You passed! Score: ${data.result.score}%`);
      } else {
        toast.error(`You did not pass. Score: ${data.result.score}%`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading quiz...</div>;
  if (!quiz)   return <div className="empty-state"><h3>Quiz not found</h3></div>;

  return (
    <div style={{ maxWidth:'700px', margin:'0 auto', padding:'2rem' }}>
      <button onClick={() => navigate(-1)}
        style={{ background:'none', border:'none', color:'#667eea', cursor:'pointer', marginBottom:'1rem', fontSize:'0.9rem' }}>
        ← Back
      </button>

      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'0.5rem' }}>{quiz.title}</h2>
        <div style={{ display:'flex', gap:'1rem', fontSize:'0.875rem', color:'#888' }}>
          <span>📝 {quiz.questions.length} questions</span>
          <span>🎯 Pass mark: {quiz.passMark}%</span>
          <span>⏱ {quiz.timeLimit} minutes</span>
        </div>
      </div>

      {result ? (
        <div className="card" style={{ textAlign:'center', padding:'2.5rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>
            {result.passed ? '🎉' : '📚'}
          </div>
          <h2 style={{ fontSize:'1.6rem', fontWeight:700, marginBottom:'0.5rem',
            color: result.passed ? '#276749' : '#c53030' }}>
            {result.passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}
          </h2>
          <div style={{ fontSize:'3rem', fontWeight:700, color:'#667eea', margin:'1rem 0' }}>
            {result.score}%
          </div>
          <p style={{ color:'#666', marginBottom:'1.5rem' }}>
            You got {result.correct} out of {result.total} questions correct.
            Pass mark was {result.passMark}%.
          </p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
              Back to Course
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/results')}>
              View All Results
            </button>
          </div>
        </div>
      ) : (
        <div>
          {quiz.questions.map((question, qIndex) => (
            <div key={question._id} className="card" style={{ marginBottom:'1rem' }}>
              <p style={{ fontWeight:600, marginBottom:'1rem', color:'#222' }}>
                {qIndex + 1}. {question.questionText}
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {question.options.map((option, oIndex) => (
                  <label key={oIndex} style={{
                    display:'flex', alignItems:'center', gap:'0.75rem',
                    padding:'0.75rem 1rem', borderRadius:'8px', cursor:'pointer',
                    border: `2px solid ${answers[qIndex] === oIndex ? '#667eea' : '#e2e8f0'}`,
                    background: answers[qIndex] === oIndex ? '#ebf4ff' : '#fafafa',
                    transition:'all 0.15s',
                  }}>
                    <input type="radio" name={`q-${qIndex}`}
                      checked={answers[qIndex] === oIndex}
                      onChange={() => handleAnswer(qIndex, oIndex)}
                      style={{ accentColor:'#667eea' }} />
                    <span style={{ fontSize:'0.95rem' }}>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}
            style={{ width:'100%', padding:'1rem', fontSize:'1rem' }}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentQuiz;
