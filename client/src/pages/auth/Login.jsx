import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email:'', password:'' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [serverErr, setServerErr] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name])  setErrors(p => ({ ...p, [name]: '' }));
    if (serverErr) setServerErr('');
  };

  const validate = () => {
    const e = {};
    if (!formData.email.trim())    e.email = 'Email is required';
    if (!formData.password)        e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
      });
      if (data.success) {
        login(data.user, data.token);
        toast.success(`Welcome back, ${data.user.fullName}!`);
        navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setServerErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>EduAI</h1>
          <p>AI-Powered Collaborative E-Learning</p>
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to continue learning</p>
        {serverErr && <div className="alert alert-error">{serverErr}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="your@email.com"
              value={formData.email} onChange={handleChange}
              className={errors.email ? 'error' : ''} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Your password"
              value={formData.password} onChange={handleChange}
              className={errors.password ? 'error' : ''} />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-footer">
          No account yet? <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
