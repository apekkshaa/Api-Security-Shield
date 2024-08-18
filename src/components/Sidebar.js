import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
    return (
        <div className="sidebar sidebar-h2">
            <h2>API Security Shield</h2>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/apis">APIs</Link></li>
                <li><Link to="/security-scans">Security Scans</Link></li>
                <li><Link to="/reports">Reports</Link></li>
                <li><Link to="/settings">Settings</Link></li>
            </ul>
        </div>
    );
}

export default Sidebar;
