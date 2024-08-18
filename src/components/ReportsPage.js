import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';

function ReportsPage() {
    const [apis, setApis] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectedApi, setSelectedApi] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('all');
    const [loading, setLoading] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5002/api/inventory')
            .then(response => setApis(response.data))
            .catch(error => console.error('Error fetching APIs', error));

        axios.get('http://localhost:5002/api/reports')
            .then(response => setReports(response.data))
            .catch(error => console.error('Error fetching reports', error));
    }, []);

    const handleGenerateReport = (e) => {
        e.preventDefault();
        setLoading(true);

        axios.post('http://localhost:5002/api/generate-report', {
            apiName: selectedApi,
            startDate,
            endDate,
            status
        })
            .then(response => {
                setReports([response.data, ...reports]);
                alert('Report generated successfully');
            })
            .catch(error => console.error('Error generating report', error))
            .finally(() => setLoading(false));
    };

    const handleViewReport = async (reportId) => {
        try {
            const response = await axios.get(`http://localhost:5002/api/report/${reportId}`);
            setPopupContent(response.data.content);
            setShowPopup(true);
        } catch (error) {
            console.error('Error fetching report content', error);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className='reports-page-container'>
            <Sidebar />
            <div className="reports-page">
                <h2>Reports</h2>
                <div className="reports-sections">

                    <div className="section-generate generate-report">
                        <h3>Generate Report</h3>
                        <form onSubmit={handleGenerateReport}>
                            <div>
                                <label>Select API:</label>
                                <select value={selectedApi} onChange={e => setSelectedApi(e.target.value)}>
                                    <option value="">Select an API</option>
                                    {apis.map(api => (
                                        <option key={api._id} value={api.name}>{api.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Date Range:</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                <span>to</span>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                            <div>
                                <label>Status:</label>
                                <select value={status} onChange={e => setStatus(e.target.value)}>
                                    <option value="all">All</option>
                                    <option value="success">Success</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Generating...' : 'Generate Report'}
                            </button>
                        </form>
                    </div>


                    <div className="section-view view-reports">
                        <h3>View Reports</h3>
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Report Name</th>
                                    <th>API</th>
                                    <th>Date Generated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(report => (
                                    <tr key={report._id}>
                                        <td>{`Report for ${report.apiName}`}</td>
                                        <td>{report.apiName}</td>
                                        <td>{new Date(report.generatedAt).toLocaleString()}</td>
                                        <td>
                                            <button onClick={() => handleViewReport(report._id)}>View Report</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

            {/* Popup for viewing report content */}
            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <button className="close-popup" onClick={closePopup}>×</button>
                        <h3>Report Content</h3>
                        <pre>{popupContent}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportsPage;
