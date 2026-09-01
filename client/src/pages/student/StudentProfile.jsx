import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';

const INTEREST_OPTIONS = [
  'Programming', 'Web Development', 'Data Science',
  'Database', 'Networking', 'Cybersecurity',
  'Mobile Development', 'Machine Learning', 'Cloud Computing',
];

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName]   = useState(user?.fullName || '');
  const [interests, setInterests] = useState(user?.interests || []);
  const [saving, setSaving]       = useState(false);

  const toggleInterest = (interest) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', { fullName, interests });
      if (data.success) {
        updateUser(data.user);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-welcome">
        <h2>My Profile</h2>
        <p>Update your personal information and learning interests.</p>
      </div>

      <div style={{ maxWidth:'600px' }}>
        <form onSubmit={handleSave}>
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontWeight:600, marginBottom:'1.25rem' }}>Personal Information</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user?.email || ''} disabled
                style={{ background:'#f7fafc', cursor:'not-allowed' }} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" value={user?.role || ''} disabled
                style={{ background:'#f7fafc', cursor:'not-allowed', textTransform:'capitalize' }} />
            </div>
            <div className="form-group">
              <label>Member Since</label>
              <input type="text" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''} disabled
                style={{ background:'#f7fafc', cursor:'not-allowed' }} />
            </div>
          </div>

          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontWeight:600, marginBottom:'0.5rem' }}>Learning Interests</h3>
            <p style={{ color:'#888', fontSize:'0.875rem', marginBottom:'1rem' }}>
              Select your interests so our AI can recommend the most relevant courses for you.
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
              {INTEREST_OPTIONS.map(interest => (
                <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                  style={{
                    padding:'0.4rem 1rem', borderRadius:'999px', border:'1.5px solid',
                    borderColor: interests.includes(interest) ? '#667eea' : '#e2e8f0',
                    background: interests.includes(interest) ? '#ebf4ff' : '#fff',
                    color: interests.includes(interest) ? '#667eea' : '#555',
                    fontWeight: interests.includes(interest) ? 600 : 400,
                    cursor:'pointer', fontSize:'0.875rem', transition:'all 0.15s',
                  }}>
                  {interests.includes(interest) ? '✓ ' : ''}{interest}
                </button>
              ))}
            </div>
            {interests.length > 0 && (
              <p style={{ marginTop:'0.75rem', fontSize:'0.8rem', color:'#667eea' }}>
                {interests.length} interest{interests.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
