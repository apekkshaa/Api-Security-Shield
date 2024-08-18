import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import APIPage from './components/APIPage';
import SecurityScansPage from './components/SecurityScansPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';


function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apis" element={<APIPage />} />
        <Route path="/security-scans" element={<SecurityScansPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;

