const express = require('express');
const router = express.Router();
const axios = require('axios');

// Trigger OWASP ZAP scan for JSONPlaceholder API
router.post('/initiate-scan', async (req, res) => {
    const apiUrl = 'https://jsonplaceholder.typicode.com'; // Target URL

    try {
        // OWASP ZAP API endpoint for starting a scan
        const zapApiUrl = 'http://localhost:8080/JSON/ascan/action/scan/';
        const response = await axios.post(zapApiUrl, null, {
            params: {
                url: apiUrl,
                recurse: true,
                inscopeOnly: false,
                scanPolicyName: '', // You can specify a policy for OWASP Top 10 here
                method: 'GET',
            }
        });

        const scanId = response.data.scan; // Unique ID for the scan
        res.status(200).json({ message: 'Scan initiated successfully!', scanId });
    } catch (error) {
        console.error('Error initiating OWASP ZAP scan:', error.message);
        res.status(500).json({ error: 'Failed to initiate scan.' });
    }
});

module.exports = router;
