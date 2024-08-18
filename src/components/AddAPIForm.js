import React, { useState } from 'react';
import axios from 'axios';

const AddApiForm = ({ onApiAdded, onClose }) => {
    const [name, setName] = useState('');
    const [apiUrl, setApiUrl] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const apiData = {
            name: name,
            apiUrl: apiUrl,
            version: "1.0",
            securityStatus: "secure",
        };

        axios.post('http://localhost:5002/api/add-api', apiData)
            .then(response => {
                onApiAdded(response.data);
                setName('');
                setApiUrl('');
                onClose();
            })
            .catch(error => {
                if (error.response) {
                    console.error('Error response data:', error.response.data);
                    console.error('Error response status:', error.response.status);
                    console.error('Error response headers:', error.response.headers);
                } else if (error.request) {
                    console.error('Error request data:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
            });
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Add New API</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </label>
                    <label>
                        API URL:
                        <input type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)} required />
                    </label>
                    <button type="submit">Add API</button>
                </form>
            </div>
        </div>
    );
};

export default AddApiForm;
