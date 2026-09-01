import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDiscussions, createDiscussion, addReply, deleteDiscussion } from '../api/discussions';
import toast from 'react-hot-toast';

const DiscussionForum = ({ courseId }) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [newTitle, setNewTitle]       = useState('');
  const [newMessage, setNewMessage]   = useState('');
  const [replyText, setReplyText]     = useState({});
  const [openReplies, setOpenReplies] = useState({});
  const [posting, setPosting]         = useState(false);

  useEffect(() => { fetchDiscussions(); }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      const { data } = await getDiscussions(courseId);
      setDiscussions(data.discussions || []);
    } catch {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      toast.error('Title and message are required'); return;
    }
    setPosting(true);
    try {
      await createDiscussion(courseId, { title: newTitle, message: newMessage });
      setNewTitle('');
      setNewMessage('');
      toast.success('Discussion posted');
      fetchDiscussions();
    } catch {
      toast.error('Failed to post discussion');
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (discussionId) => {
    const text = replyText[discussionId];
    if (!text?.trim()) { toast.error('Reply cannot be empty'); return; }
    try {
      await addReply(courseId, discussionId, { message: text });
      setReplyText(p => ({ ...p, [discussionId]: '' }));
      toast.success('Reply added');
      fetchDiscussions();
    } catch {
      toast.error('Failed to add reply');
    }
  };

  const handleDelete = async (discussionId) => {
    if (!window.confirm('Delete this discussion?')) return;
    try {
      await deleteDiscussion(courseId, discussionId);
      toast.success('Deleted');
      fetchDiscussions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleReplies = (id) => {
    setOpenReplies(p => ({ ...p, [id]: !p[id] }));
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
    day:'numeric', month:'short', year:'numeric',
  });

  if (loading) return <div style={{ padding:'1rem', color:'#888' }}>Loading discussions...</div>;

  return (
    <div style={{ marginTop:'2rem' }}>
      <h3 style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:'1.25rem' }}>
        💬 Course Discussion ({discussions.length})
      </h3>

      {/* New post form */}
      <div style={{ background:'#f7fafc', borderRadius:'12px', padding:'1.25rem', marginBottom:'1.5rem' }}>
        <h4 style={{ fontWeight:600, marginBottom:'1rem', fontSize:'0.95rem' }}>Start a Discussion</h4>
        <form onSubmit={handlePost}>
          <input type="text" placeholder="Discussion title..." value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={{ width:'100%', padding:'0.65rem 1rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.9rem', marginBottom:'0.75rem', outline:'none' }} />
          <textarea placeholder="Share your thoughts, questions, or insights..." value={newMessage}
            onChange={e => setNewMessage(e.target.value)} rows={3}
            style={{ width:'100%', padding:'0.65rem 1rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.9rem', resize:'vertical', outline:'none', marginBottom:'0.75rem' }} />
          <button type="submit" disabled={posting}
            style={{ padding:'0.6rem 1.5rem', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, cursor:'pointer', fontSize:'0.9rem' }}>
            {posting ? 'Posting...' : 'Post Discussion'}
          </button>
        </form>
      </div>

      {/* Discussion list */}
      {discussions.length === 0 ? (
        <div style={{ textAlign:'center', padding:'2rem', color:'#888' }}>
          <p>No discussions yet. Be the first to start one!</p>
        </div>
      ) : (
        discussions.map(d => (
          <div key={d._id} style={{ background:'#fff', borderRadius:'12px', padding:'1.25rem', marginBottom:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #e2e8f0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
              <h4 style={{ fontWeight:600, color:'#222', fontSize:'0.95rem' }}>{d.title}</h4>
              {(user?._id === d.userId?._id || user?.role === 'admin') && (
                <button onClick={() => handleDelete(d._id)}
                  style={{ background:'none', border:'none', color:'#e53e3e', cursor:'pointer', fontSize:'0.8rem' }}>
                  Delete
                </button>
              )}
            </div>
            <p style={{ color:'#555', fontSize:'0.875rem', lineHeight:1.6, marginBottom:'0.75rem' }}>{d.message}</p>
            <div style={{ fontSize:'0.78rem', color:'#888', marginBottom:'0.75rem' }}>
              <span style={{ fontWeight:500, color:'#667eea' }}>{d.userId?.fullName}</span>
              {d.userId?.role === 'admin' && <span style={{ background:'#e9d8fd', color:'#6b46c1', borderRadius:'999px', padding:'0.1rem 0.5rem', fontSize:'0.7rem', marginLeft:'0.4rem' }}>Admin</span>}
              &nbsp;· {formatDate(d.createdAt)}
            </div>

            {/* Replies toggle */}
            <button onClick={() => toggleReplies(d._id)}
              style={{ background:'none', border:'none', color:'#667eea', cursor:'pointer', fontSize:'0.82rem', fontWeight:500, marginBottom:'0.5rem' }}>
              {openReplies[d._id] ? '▲ Hide' : '▼ Show'} Replies ({d.replies?.length || 0})
            </button>

            {openReplies[d._id] && (
              <div style={{ marginLeft:'1rem', borderLeft:'2px solid #e2e8f0', paddingLeft:'1rem' }}>
                {d.replies?.map((reply, i) => (
                  <div key={i} style={{ marginBottom:'0.75rem', paddingBottom:'0.75rem', borderBottom:'1px solid #f0f4f8' }}>
                    <div style={{ fontSize:'0.78rem', color:'#888', marginBottom:'0.25rem' }}>
                      <span style={{ fontWeight:500, color:'#667eea' }}>{reply.userId?.fullName}</span>
                      &nbsp;· {formatDate(reply.createdAt)}
                    </div>
                    <p style={{ fontSize:'0.875rem', color:'#555', lineHeight:1.6 }}>{reply.message}</p>
                  </div>
                ))}
                <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem' }}>
                  <input type="text" placeholder="Write a reply..."
                    value={replyText[d._id] || ''}
                    onChange={e => setReplyText(p => ({ ...p, [d._id]: e.target.value }))}
                    style={{ flex:1, padding:'0.5rem 0.75rem', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'0.875rem', outline:'none' }} />
                  <button onClick={() => handleReply(d._id)}
                    style={{ padding:'0.5rem 1rem', background:'#667eea', color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default DiscussionForum;
