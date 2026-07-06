import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Routes will be added here as we build each feature */}
        <Route path="/" element={<div>AI E-Learning System - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}

export default App;
