import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4f8', flexDirection:'column', textAlign:'center', padding:'2rem' }}>
      <div style={{ fontSize:'5rem', marginBottom:'1rem' }}>404</div>
      <h2 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:'0.5rem', color:'#222' }}>Page Not Found</h2>
      <p style={{ color:'#888', marginBottom:'2rem' }}>The page you are looking for does not exist.</p>
      <button onClick={() => navigate('/')}
        style={{ padding:'0.75rem 2rem', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, cursor:'pointer', fontSize:'1rem' }}>
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
