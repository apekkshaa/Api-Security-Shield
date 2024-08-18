import React, { useEffect, useState } from 'react';
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register the necessary components
Chart.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
);

function Dashboard() {
    const [apis, setApis] = useState([]);
    const [summary, setSummary] = useState({ totalApis: 0, securedApis: 0, attentionNeeded: 0 });
    const [recentScans, setRecentScans] = useState([]);
    const [incidentNotifications, setIncidentNotifications] = useState([]);
    const [apiSecurityStatus, setApiSecurityStatus] = useState({ securedApis: 0, insecureApis: 0 });
    const [incidentTrends, setIncidentTrends] = useState([]);

    useEffect(() => {
        // Fetch API Inventory
        fetch('http://localhost:5002/api/inventory')
            .then(response => response.json())
            .then(data => setApis(data));

        // Fetch Inventory Summary
        fetch('http://localhost:5002/api/inventory-summary')
            .then(response => response.json())
            .then(data => setSummary(data));

        // Fetch Recent Security Scans
        fetch('http://localhost:5002/api/recent-scans')
            .then(response => response.json())
            .then(data => setRecentScans(data));

        // Fetch Incident Notifications
        fetch('http://localhost:5002/api/recent-incidents')
            .then(response => response.json())
            .then(data => setIncidentNotifications(data));

        // Fetch API Security Status
        fetch('http://localhost:5002/api/api-security-status')
            .then(response => response.json())
            .then(data => setApiSecurityStatus(data));

        // Fetch Incident Trends
        fetch('http://localhost:5002/api/incident-trends')
            .then(response => response.json())
            .then(data => setIncidentTrends(data));
    }, []);

    const resolveIncident = (id) => {
        fetch(`http://localhost:5002/api/resolve-incident/${id}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .then(updatedIncident => {
                setIncidentNotifications(prevIncidents =>
                    prevIncidents.map(incident =>
                        incident._id === updatedIncident._id ? updatedIncident : incident
                    ).filter(incident => !incident.resolved)
                );
            });
    };

    // Data for API Security Status Pie Chart
    const pieData = {
        labels: ['Secured APIs', 'Insecure APIs'],
        datasets: [
            {
                data: [apiSecurityStatus.securedApis, apiSecurityStatus.insecureApis],
                backgroundColor: ['#4CAF50', '#F44336'],
                hoverBackgroundColor: ['#66BB6A', '#EF5350']
            }
        ]
    };

    // Data for Incident Trends Line Chart
    const lineData = {
        labels: incidentTrends.map(item => `${item._id.month}/${item._id.year}`),
        datasets: [
            {
                label: 'Number of Incidents',
                data: incidentTrends.map(item => item.count),
                fill: false,
                backgroundColor: '#42A5F5',
                borderColor: '#1E88E5'
            }
        ]
    };

    return (
        <div className="dashboard">
            <h2>Dashboard</h2>
            <div className="dashboard-sections">
                <div className="section">
                    <h3>API Inventory</h3>
                    <table className="api-table">
                        <thead>
                            <tr>
                                <th>API Name</th>
                                <th>Version</th>
                                <th>Security Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apis.map((api, index) => (
                                <tr key={index}>
                                    <td>{api.name}</td>
                                    <td>{api.version}</td>
                                    <td style={{ color: getColor(api.securityStatus) }}>{api.securityStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="section">
                    <h3>API Summary</h3>
                    <p>Total APIs: {summary.totalApis}</p>
                    <p>Secured APIs: {summary.securedApis}</p>
                    <p>APIs Needing Attention: {summary.attentionNeeded}</p>
                </div>
                <div className="section">
                    <h3>Recent Security Scans</h3>
                    <ul>
                        {recentScans.map((scan, index) => (
                            <li key={index}>
                                <strong>{scan.apiName}</strong> - {new Date(scan.scanDate).toLocaleString()} - <em>{scan.outcome}</em>
                                <ul>
                                    {scan.vulnerabilities.map((vuln, i) => (
                                        <li key={i}>{vuln}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="section">
                    <h3>API Security Status</h3>
                    <Pie data={pieData} />
                </div>
            </div>
        </div>
    );
}

function getSeverityColor(severity) {
    if (severity === 'High') return 'red';
    if (severity === 'Medium') return 'orange';
    return 'green';
}

function getColor(status) {
    if (status === 'Secure') return 'green';
    if (status === 'Issues Detected') return 'red';
    return 'orange';
}

export default Dashboard;
