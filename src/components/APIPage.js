import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import AddAPIForm from './AddAPIForm';
import ViewAPIDetails from './ViewAPIDetails';
import axios from 'axios';

function APIPage() {
    const [apis, setApis] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [showAddApiModal, setShowAddApiModal] = useState(false);
    const [selectedApi, setSelectedApi] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5002/api/inventory')
            .then(response => setApis(response.data))
            .catch(error => console.error('Error fetching APIs:', error));
    }, []);
    const handleSearch = (event) => {
        setSearch(event.target.value);
    };
    const handleFilter = (event) => {
        setFilter(event.target.value);
    };
    const handleAddApi = (api) => {
        setApis(prevApis => [...prevApis, api]);
    };
    const filteredApis = apis.filter(api => {
        return (filter === 'all' || api.securityStatus.toLowerCase() === filter.toLowerCase()) &&
            (api.name.toLowerCase().includes(search.toLowerCase()) || api.version.includes(search));
    });

    const initiateScan = (apiId) => {
        axios.post(`http://localhost:5002/api/initiate-scan/${apiId}`,
            { outcome: 'Pending', vulnerabilities: [] })
            .then(() => {
                alert('Scan initiated');
            })
            .catch(error => console.error('Error initiating scan:', error));
    };

    return (
        <div className='api-page-container'>
            <Sidebar />
            <div className="api-page">
                <h2>List of APIs</h2>
                <div className="search-filter">
                    <input type="text" placeholder="Search APIs..." value={search} onChange={handleSearch} />
                    <select value={filter} onChange={handleFilter}>
                        <option value="all">All</option>
                        <option value="Secure">Secure</option>
                        <option value="Issues Detected">Issues Detected</option>
                        <option value="Pending Review">Pending Review</option>
                    </select>
                </div>
                <button className="add-api-btn" onClick={() => setShowAddApiModal(true)}>Add New API</button>
                <table className="api-table">
                    <thead>
                        <tr>
                            <th>API Name</th>
                            <th>Version</th>
                            <th>Security Status</th>
                            <th>Last Scanned</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApis.map(api => (
                            <tr key={api._id}>
                                <td>{api.name}</td>
                                <td>{api.version}</td>
                                <td style={{ color: api.securityStatus === 'Secure' ? 'green' : 'red' }}>
                                    {api.securityStatus}
                                </td>
                                <td>{api.lastScanned ? new Date(api.lastScanned).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <button onClick={() => { setSelectedApi(api._id); setShowDetailsModal(true); }}>View Details</button>
                                    <button onClick={() => initiateScan(api._id)}>Initiate Scan</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showAddApiModal && <AddAPIForm onClose={() => setShowAddApiModal(false)} onApiAdded={handleAddApi} />}
            {showDetailsModal && <ViewAPIDetails apiId={selectedApi} onClose={() => setShowDetailsModal(false)} />}
        </div>

    );
}

export default APIPage;
