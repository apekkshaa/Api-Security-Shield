import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ViewAPIDetails({ apiId, onClose }) {
    const [api, setApi] = useState(null);

    useEffect(() => {
        axios.get(`/api/api/${apiId}`)
            .then(response => setApi(response.data))
            .catch(error => console.error('Error fetching API details:', error));
    }, [apiId]);

    if (!api) return <div>Loading...</div>;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>API Details</h2>
                <p><strong>API Name:</strong> {api.name}</p>
                <p><strong>Version:</strong> {api.version}</p>
                <p><strong>Security Status:</strong> {api.securityStatus}</p>
                <p><strong>Last Scanned:</strong> {api.lastScanned ? new Date(api.lastScanned).toLocaleDateString() : 'N/A'}</p>
                {/* Additional details can be displayed here */}
            </div>
        </div>
    );
}

export default ViewAPIDetails;
