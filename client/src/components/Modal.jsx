const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000, padding:'1rem',
    }}>
      <div style={{
        background:'#fff', borderRadius:'16px', padding:'2rem',
        width:'100%', maxWidth:'560px', maxHeight:'90vh',
        overflowY:'auto', position:'relative',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ fontSize:'1.2rem', fontWeight:600 }}>{title}</h2>
          <button onClick={onClose} style={{
            background:'none', border:'none', fontSize:'1.5rem',
            cursor:'pointer', color:'#888', lineHeight:1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
