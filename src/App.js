import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import APIPage from './components/APIPage';
import SecurityScansPage from './components/SecurityScansPage';
import ReportsPage from './components/ReportsPage';


function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apis" element={<APIPage />} />
        <Route path="/security-scans" element={<SecurityScansPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </div>
  );
}

export default App;

