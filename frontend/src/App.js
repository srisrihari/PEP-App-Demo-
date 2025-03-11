import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Login from './components/Login';
import StudentDashboard from './components/student/StudentDashboard';
import ProfessorDashboard from './components/professor/ProfessorDashboard';
import Navigation from './components/Navigation';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        {user && <Navigation user={user} onLogout={handleLogout} />}
        <div className="container mt-4">
          <Routes>
            <Route 
              path="/" 
              element={!user ? <Login onLogin={handleLogin} /> : 
                (user.role === 'student' ? 
                  <Navigate to="/student" /> : 
                  <Navigate to="/professor" />)
              } 
            />
            <Route 
              path="/student" 
              element={user && user.role === 'student' ? 
                <StudentDashboard user={user} /> : 
                <Navigate to="/" />} 
            />
            <Route 
              path="/professor" 
              element={user && user.role === 'professor' ? 
                <ProfessorDashboard user={user} /> : 
                <Navigate to="/" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;