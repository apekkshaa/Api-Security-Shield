const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const Api = require('../models/Api');

router.post('/initiate-scan/:apiId', async (req, res) => {
    const { apiId } = req.params;

    try {
        const api = await Api.findById(apiId);
        if (!api) return res.status(404).json({ error: 'API not found' });

        const owaspTop10Checks = [
            'Injection',
            'Broken Authentication',
            'Sensitive Data Exposure',
            'XML External Entities (XXE)',
            'Broken Access Control',
            'Security Misconfiguration',
            'Cross-Site Scripting (XSS)',
            'Insecure Deserialization',
            'Using Components with Known Vulnerabilities',
            'Insufficient Logging & Monitoring'
        ];

        const detectedVulnerabilities = owaspTop10Checks.filter(() => Math.random() < 0.3);

        const outcome = detectedVulnerabilities.length > 0 ? 'Issues Detected' : 'No Issues';

        const newScan = new Scan({
            apiId: api._id,
            outcome,
            vulnerabilities: detectedVulnerabilities,
            owaspTop10: detectedVulnerabilities,
            scanDepth: api.scanSettings.depth
        });

        await newScan.save();

        api.lastScanned = new Date();
        api.securityStatus = outcome === 'No Issues' ? 'Secure' : 'Issues Detected';
        await api.save();

        res.status(201).json(newScan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:apiId/scans', async (req, res) => {
    const { apiId } = req.params;

    try {
        const scans = await Scan.find({ apiId }).sort({ scanDate: -1 });
        res.json(scans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:apiId/scan-settings', async (req, res) => {
    const { apiId } = req.params;
    const { frequency, depth, vulnerabilitiesToCheck } = req.body;

    try {
        const api = await Api.findById(apiId);
        if (!api) return res.status(404).json({ error: 'API not found' });

        api.scanSettings = { frequency, depth, vulnerabilitiesToCheck };
        await api.save();

        res.json(api.scanSettings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
