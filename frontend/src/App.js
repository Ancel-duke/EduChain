import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import InstitutionDashboard from './pages/InstitutionDashboard';
import Verification from './pages/Verification';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<InstitutionDashboard />} />
          <Route path="/verify" element={<Verification />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
