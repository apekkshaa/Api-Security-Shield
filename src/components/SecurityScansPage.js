import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';

function SecurityScansPage() {
    const [apis, setApis] = useState([]);
    const [selectedApiId, setSelectedApiId] = useState(null);
    const [scanSettings, setScanSettings] = useState({
        frequency: 'weekly',
        depth: 'moderate',
        vulnerabilities: {
            sqlInjection: true,
            xss: true,
            csrf: true,
        },
    });

    useEffect(() => {
        // Fetch the API inventory with the last scan details
        const fetchApis = async () => {
            try {
                const response = await axios.get('http://localhost:5002/api/inventory');
                setApis(response.data);
            } catch (error) {
                console.error('Error fetching APIs:', error);
            }
        };

        fetchApis();
    }, []);

    const handleScanNow = async (apiId) => {
        try {
            await axios.post(`http://localhost:5002/scans/initiate-scan/${apiId}`);
            alert('Scan initiated successfully!');
            // Optionally, refresh the API list or fetch recent scans to update the UI
        } catch (error) {
            console.error('Error initiating scan:', error);
            alert('Failed to initiate scan.');
        }
    };

    const handleViewHistory = async (apiId) => {
        setSelectedApiId(apiId);
        // This could open a modal or redirect to a detailed history page
        alert('Viewing scan history for API ID: ' + apiId);
    };

    const handleSaveSettings = async (event) => {
        event.preventDefault();
        try {
            await axios.put(`http://localhost:5002/scans/${selectedApiId}/scan-settings`, {
                frequency: scanSettings.frequency,
                depth: scanSettings.depth,
                vulnerabilitiesToCheck: Object.keys(scanSettings.vulnerabilities).filter(
                    key => scanSettings.vulnerabilities[key]
                )
            });
            alert('Scan settings saved successfully!');
        } catch (error) {
            console.error('Error saving scan settings:', error);
            alert('Failed to save scan settings.');
        }
    };

    const handleSettingsChange = (event) => {
        const { name, value, type, checked } = event.target;
        if (type === 'checkbox') {
            setScanSettings((prevSettings) => ({
                ...prevSettings,
                vulnerabilities: {
                    ...prevSettings.vulnerabilities,
                    [name]: checked,
                },
            }));
        } else {
            setScanSettings((prevSettings) => ({
                ...prevSettings,
                [name]: value,
            }));
        }
    };

    return (
        <div className='security-page-container'>
            <Sidebar />
            <div className="security-scans-page">
                <h2>Security Scans</h2>

                <table className="scans-table">
                    <thead>
                        <tr>
                            <th>API Name</th>
                            <th>Last Scan Date</th>
                            <th>Vulnerabilities Detected</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apis.map(api => (
                            <tr key={api._id}>
                                <td>{api.name}</td>
                                <td>{api.lastScanned ? new Date(api.lastScanned).toLocaleDateString() : 'Never Scanned'}</td>
                                <td style={{ color: api.securityStatus === 'Issues Detected' ? 'red' : 'green' }}>
                                    {api.securityStatus === 'Issues Detected' ? 'Issues Detected' : 'No Issues'}
                                </td>
                                <td>
                                    <button onClick={() => handleScanNow(api._id)}>Scan Now</button>
                                    <button onClick={() => handleViewHistory(api._id)}>View History</button>
                                    <button onClick={() => setSelectedApiId(api._id)}>Scan Settings</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="scan-settings">
                    <h3>Scan Settings</h3>
                    <form onSubmit={handleSaveSettings}>
                        <div>
                            <label>Scan Frequency:</label>
                            <select
                                name="frequency"
                                value={scanSettings.frequency}
                                onChange={handleSettingsChange}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label>Scan Depth:</label>
                            <select
                                name="depth"
                                value={scanSettings.depth}
                                onChange={handleSettingsChange}
                            >
                                <option value="shallow">Shallow</option>
                                <option value="moderate">Moderate</option>
                                <option value="deep">Deep</option>
                            </select>
                        </div>
                        <div>
                            <label>Vulnerabilities to Check:</label>
                            <div>
                                <input
                                    type="checkbox"
                                    id="sqlInjection"
                                    name="sqlInjection"
                                    checked={scanSettings.vulnerabilities.sqlInjection}
                                    onChange={handleSettingsChange}
                                />
                                <label htmlFor="sqlInjection">SQL Injection</label>
                            </div>
                            <div>
                                <input
                                    type="checkbox"
                                    id="xss"
                                    name="xss"
                                    checked={scanSettings.vulnerabilities.xss}
                                    onChange={handleSettingsChange}
                                />
                                <label htmlFor="xss">Cross-Site Scripting (XSS)</label>
                            </div>
                            <div>
                                <input
                                    type="checkbox"
                                    id="csrf"
                                    name="csrf"
                                    checked={scanSettings.vulnerabilities.csrf}
                                    onChange={handleSettingsChange}
                                />
                                <label htmlFor="csrf">Cross-Site Request Forgery (CSRF)</label>
                            </div>
                        </div>
                        <button type="submit">Save Settings</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SecurityScansPage;
