import React from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';

function Home() {
    return (
        <div className="app">
            <Sidebar />
            <Dashboard />
        </div>
    );
}

export default Home;