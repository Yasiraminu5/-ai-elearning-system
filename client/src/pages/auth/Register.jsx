import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ fullName:'', email:'', password:'', confirm:'', role:'student' });
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
    if (!formData.fullName.trim())            e.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 3) e.fullName = 'At least 3 characters';
    if (!formData.email.trim())               e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    if (!formData.password)                   e.password = 'Password is required';
    else if (formData.password.length < 6)    e.password = 'At least 6 characters';
    if (formData.password !== formData.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      if (data.success) {
        login(data.user, data.token);
        toast.success(`Welcome, ${data.user.fullName}!`);
        navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
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
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join thousands of learners today</p>
        {serverErr && <div className="alert alert-error">{serverErr}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <input name="fullName" type="text" placeholder="Your full name"
              value={formData.fullName} onChange={handleChange}
              className={errors.fullName ? 'error' : ''} />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="your@email.com"
              value={formData.email} onChange={handleChange}
              className={errors.email ? 'error' : ''} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="At least 6 characters"
              value={formData.password} onChange={handleChange}
              className={errors.password ? 'error' : ''} />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input name="confirm" type="password" placeholder="Re-enter password"
              value={formData.confirm} onChange={handleChange}
              className={errors.confirm ? 'error' : ''} />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>
          <div className="form-group">
            <label>I am registering as</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
