const difficultyColor = {
  beginner:     'badge-green',
  intermediate: 'badge-blue',
  advanced:     'badge-purple',
};

const CourseCard = ({ course, onEnroll, onView, onEdit, onDelete, isEnrolled, isAdmin }) => {
  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <h3 style={{ fontSize:'1rem', fontWeight:600, color:'#222', flex:1 }}>{course.title}</h3>
        <span className={`badge ${difficultyColor[course.difficultyLevel] || 'badge-blue'}`}>
          {course.difficultyLevel}
        </span>
      </div>

      <p style={{ fontSize:'0.875rem', color:'#666', lineHeight:1.5 }}>
        {course.description?.length > 100
          ? course.description.substring(0, 100) + '...'
          : course.description}
      </p>

      <div style={{ fontSize:'0.8rem', color:'#888' }}>
        📂 {course.category} &nbsp;|&nbsp; 👥 {course.enrollmentCount || 0} enrolled
      </div>

      {!course.isPublished && (
        <span className="badge badge-red">Unpublished</span>
      )}

      <div style={{ display:'flex', gap:'0.5rem', marginTop:'auto', flexWrap:'wrap' }}>
        {onView && (
          <button className="btn btn-secondary btn-sm" onClick={() => onView(course._id)}>
            View
          </button>
        )}
        {isAdmin && onEdit && (
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(course)}>
            Edit
          </button>
        )}
        {isAdmin && onDelete && (
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(course._id)}>
            Delete
          </button>
        )}
        {!isAdmin && !isEnrolled && course.isPublished && onEnroll && (
          <button className="btn btn-primary btn-sm" onClick={() => onEnroll(course._id)}>
            Enroll
          </button>
        )}
        {!isAdmin && isEnrolled && (
          <span className="badge badge-green">✓ Enrolled</span>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
