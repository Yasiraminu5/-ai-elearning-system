import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, go to the correct dashboard
  const handleGetStarted = () => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleSignIn = () => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    { icon: '🤖', title: 'AI-Powered Recommendations', desc: 'Our intelligent rule-based engine analyses your performance and interests to suggest the most relevant courses and quizzes for you.' },
    { icon: '📚', title: 'Rich Course Library', desc: 'Access a growing library of structured courses across programming, web development, data science, and more.' },
    { icon: '📝', title: 'Interactive Quizzes', desc: 'Test your knowledge with auto-graded quizzes and get instant feedback on your performance.' },
    { icon: '🗺️', title: 'Personalized Learning Path', desc: 'Follow a customized learning path built specifically around your strengths, weaknesses, and goals.' },
    { icon: '💬', title: 'Collaborative Discussion', desc: 'Engage with peers through course discussion forums, ask questions, and share knowledge.' },
    { icon: '📊', title: 'Progress Tracking', desc: 'Monitor your learning progress, quiz scores, and course completion in real time from your dashboard.' },
  ];

  const steps = [
    { number: '01', title: 'Create an Account', desc: 'Register as a student in seconds. Set your interests to personalise your experience.' },
    { number: '02', title: 'Browse and Enroll', desc: 'Explore available courses and enroll in those that match your goals.' },
    { number: '03', title: 'Learn and Practice', desc: 'Study lesson content, complete quizzes, and track your progress as you go.' },
    { number: '04', title: 'Get Recommendations', desc: 'Our AI engine continuously updates your recommendations based on your performance and activity.' },
  ];

  return (
    <div style={{ fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color:'#333' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(255,255,255,0.95)', backdropFilter:'blur(10px)',
        padding:'1rem 2rem', display:'flex',
        justifyContent:'space-between', alignItems:'center',
        boxShadow:'0 2px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#667eea' }}>
          EduAI
        </div>
        <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
          {user ? (
            <>
              <span style={{ fontSize:'0.875rem', color:'#555' }}>
                Welcome, {user.fullName}
              </span>
              <button onClick={handleGetStarted}
                style={{ padding:'0.5rem 1.25rem', borderRadius:'8px', border:'none', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'0.9rem' }}>
                Go to Dashboard
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSignIn}
                style={{ padding:'0.5rem 1.25rem', borderRadius:'8px', border:'1.5px solid #667eea', background:'transparent', color:'#667eea', fontWeight:600, cursor:'pointer', fontSize:'0.9rem' }}>
                Sign In
              </button>
              <button onClick={handleGetStarted}
                style={{ padding:'0.5rem 1.25rem', borderRadius:'8px', border:'none', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'0.9rem' }}>
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        padding:'6rem 2rem', textAlign:'center', color:'#fff',
      }}>
        <div style={{ maxWidth:'800px', margin:'0 auto' }}>
          <div style={{ display:'inline-block', background:'rgba(255,255,255,0.15)', borderRadius:'999px', padding:'0.4rem 1.2rem', fontSize:'0.85rem', marginBottom:'1.5rem', backdropFilter:'blur(10px)' }}>
            🎓 AI-Powered E-Learning Platform
          </div>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, lineHeight:1.2, marginBottom:'1.5rem' }}>
            Learn Smarter with
            <br />
            <span style={{ color:'#ffd700' }}>Personalised AI Guidance</span>
          </h1>
          <p style={{ fontSize:'1.1rem', lineHeight:1.8, marginBottom:'2.5rem', opacity:0.9, maxWidth:'600px', margin:'0 auto 2.5rem' }}>
            An intelligent collaborative e-learning system that adapts to your learning style, tracks your progress, and recommends the best courses and quizzes based on your performance.
          </p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            {user ? (
              <button onClick={handleGetStarted}
                style={{ padding:'0.9rem 2.5rem', borderRadius:'10px', border:'none', background:'#fff', color:'#667eea', fontWeight:700, cursor:'pointer', fontSize:'1rem', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button onClick={handleGetStarted}
                  style={{ padding:'0.9rem 2.5rem', borderRadius:'10px', border:'none', background:'#fff', color:'#667eea', fontWeight:700, cursor:'pointer', fontSize:'1rem', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
                  Start Learning Free →
                </button>
                <button onClick={handleSignIn}
                  style={{ padding:'0.9rem 2.5rem', borderRadius:'10px', border:'2px solid rgba(255,255,255,0.6)', background:'transparent', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'1rem' }}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background:'#fff', padding:'3rem 2rem' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'2rem', textAlign:'center' }}>
          {[
            { value:'6+',   label:'Expert Courses'    },
            { value:'3+',   label:'Practice Quizzes'  },
            { value:'5',    label:'AI Rules Engine'   },
            { value:'100%', label:'Free to Start'     },
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize:'2.5rem', fontWeight:800, color:'#667eea', marginBottom:'0.25rem' }}>{stat.value}</div>
              <div style={{ color:'#888', fontSize:'0.9rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ background:'#f0f4f8', padding:'5rem 2rem' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 style={{ fontSize:'2rem', fontWeight:700, marginBottom:'0.75rem' }}>
              Everything You Need to Learn Effectively
            </h2>
            <p style={{ color:'#666', maxWidth:'500px', margin:'0 auto' }}>
              Built with modern technology and powered by an intelligent recommendation engine.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:'16px', padding:'2rem', boxShadow:'0 2px 15px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight:700, marginBottom:'0.75rem', fontSize:'1.05rem' }}>{f.title}</h3>
                <p style={{ color:'#666', fontSize:'0.9rem', lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background:'#fff', padding:'5rem 2rem' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 style={{ fontSize:'2rem', fontWeight:700, marginBottom:'0.75rem' }}>How It Works</h2>
            <p style={{ color:'#666' }}>Get started in four simple steps.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'2rem' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign:'center', padding:'1.5rem' }}>
                <div style={{ fontSize:'2.5rem', fontWeight:800, color:'#e2e8f0', marginBottom:'1rem', lineHeight:1 }}>{s.number}</div>
                <h3 style={{ fontWeight:700, marginBottom:'0.75rem', fontSize:'1rem' }}>{s.title}</h3>
                <p style={{ color:'#666', fontSize:'0.875rem', lineHeight:1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Section ── */}
      <section style={{ background:'linear-gradient(135deg,#667eea,#764ba2)', padding:'5rem 2rem', color:'#fff' }}>
        <div style={{ maxWidth:'800px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🤖</div>
          <h2 style={{ fontSize:'2rem', fontWeight:700, marginBottom:'1rem' }}>
            Powered by Intelligent Recommendations
          </h2>
          <p style={{ opacity:0.9, lineHeight:1.8, marginBottom:'2rem', fontSize:'1rem' }}>
            Our rule-based AI engine analyses five key factors: your stated interests, quiz performance, course completion, weak topic areas, and current learning level. It uses these to generate personalised course recommendations, suggest quizzes you are ready for, and build a custom learning path — all updated automatically as you learn.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem', marginBottom:'2.5rem' }}>
            {['Interest Match','Remedial Support','Progression','Quiz Readiness','Smart Fallback'].map((rule, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.15)', borderRadius:'10px', padding:'0.75rem', fontSize:'0.85rem', fontWeight:500, backdropFilter:'blur(5px)' }}>
                ✓ Rule {i+1}: {rule}
              </div>
            ))}
          </div>
          <button onClick={handleGetStarted}
            style={{ padding:'0.9rem 2.5rem', borderRadius:'10px', border:'none', background:'#fff', color:'#667eea', fontWeight:700, cursor:'pointer', fontSize:'1rem' }}>
            {user ? 'Go to Dashboard →' : 'Try It Free →'}
          </button>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:'#f0f4f8', padding:'5rem 2rem', textAlign:'center' }}>
        <div style={{ maxWidth:'600px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'2rem', fontWeight:700, marginBottom:'1rem' }}>
            {user ? `Continue Learning, ${user.fullName}` : 'Ready to Start Learning?'}
          </h2>
          <p style={{ color:'#666', marginBottom:'2rem', lineHeight:1.7 }}>
            {user
              ? 'Head back to your dashboard to continue your personalised learning journey.'
              : 'Join EduAI today and experience a smarter way to learn. Create your free account and get personalised course recommendations instantly.'
            }
          </p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            {user ? (
              <button onClick={handleGetStarted}
                style={{ padding:'0.9rem 2.5rem', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'1rem' }}>
                Go to Dashboard
              </button>
            ) : (
              <>
                <button onClick={handleGetStarted}
                  style={{ padding:'0.9rem 2.5rem', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'1rem' }}>
                  Create Free Account
                </button>
                <button onClick={handleSignIn}
                  style={{ padding:'0.9rem 2.5rem', borderRadius:'10px', border:'1.5px solid #667eea', background:'transparent', color:'#667eea', fontWeight:600, cursor:'pointer', fontSize:'1rem' }}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background:'#1a202c', color:'#a0aec0', padding:'2rem', textAlign:'center', fontSize:'0.875rem' }}>
        <div style={{ color:'#fff', fontWeight:700, fontSize:'1.2rem', marginBottom:'0.5rem' }}>EduAI</div>
        <p>AI-Powered Collaborative E-Learning System</p>
        <p style={{ marginTop:'0.5rem', fontSize:'0.8rem' }}>
          Final Year Project — Computer Science — {new Date().getFullYear()}
        </p>
      </footer>

    </div>
  );
};

export default Landing;
