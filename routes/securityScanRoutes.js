const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/initiate-scan', async (req, res) => {
    const apiUrl = 'https://jsonplaceholder.typicode.com';

    try {
        const zapApiUrl = 'http://localhost:8080/JSON/ascan/action/scan/';
        const response = await axios.post(zapApiUrl, null, {
            params: {
                url: apiUrl,
                recurse: true,
                inscopeOnly: false,
                scanPolicyName: '',
                method: 'GET',
            }
        });

        const scanId = response.data.scan;
        res.status(200).json({ message: 'Scan initiated successfully!', scanId });
    } catch (error) {
        console.error('Error initiating OWASP ZAP scan:', error.message);
        res.status(500).json({ error: 'Failed to initiate scan.' });
    }
});

module.exports = router;
