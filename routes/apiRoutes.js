//routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const Api = require('../models/Api');
const Scan = require('../models/Scan');
const Incident = require('../models/Incident');
const Report = require('../models/Report');
const initiateScan = require('../routes/jestScan');
const runDependencyCheck = require('../routes/dependencyScan');
const initiateZapScan = require('../utils/zapScan');
const axios = require('axios');
const SSE = require('express-sse');

// Inventory Summary dashboard
router.get('/inventory-summary', async (req, res) => {
    try {
        const totalApisCount = await Api.countDocuments();
        const securedApisCount = await Api.countDocuments({ securityStatus: 'Secure' });
        const insecureApisCount = await Api.countDocuments({ securityStatus: 'Insecure' });
        const notScannedApisCount = await Api.countDocuments({ securityStatus: 'Not Scanned' });
        console.log({
            totalApisCount,
            securedApisCount,
            insecureApisCount,
            notScannedApisCount,
        });

        const attentionNeededCount = insecureApisCount

        res.json({
            totalApis: totalApisCount,
            securedApis: securedApisCount,
            notScannedApis: notScannedApisCount,
            attentionNeeded: attentionNeededCount,
            insecureApis: insecureApisCount,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Inventory dashboard
router.get('/inventory', async (req, res) => {
    try {
        const apisWithIssues = await Api.find({
            $or: [
                { securityStatus: 'Insecure' }
            ]
        }).sort({ lastScanned: -1 });
        res.json(apisWithIssues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Inventory apis
router.get('/APIinventory', async (req, res) => {
    try {
        const apis = await Api.find().sort({ lastScanned: -1 });
        res.json(apis);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch the version from the API URL
async function fetchApiVersion(apiUrl) {
    try {
        const response = await axios.get(apiUrl, { timeout: 5000 });
        if (response.status === 200 && response.data.version) {
            return response.data.version;
        } else {
            return '1.0'
        }
    } catch (error) {
        console.error(`Error fetching API version from ${apiUrl}: ${error.message}`);
        return '1.0';
    }
}

// Update existing API version for all APIs
async function updateApiVersions() {
    const apis = await Api.find();
    for (const api of apis) {
        const version = await fetchApiVersion(api.apiUrl);
        api.version = version;
        await api.save();
    }
}

// Call updateApiVersions when server starts
updateApiVersions().catch(console.error);

// Update versions for all existing APIs
router.put('/update-api-versions', async (req, res) => {
    try {
        const apis = await Api.find();
        const updatePromises = apis.map(async (api) => {
            const version = await fetchApiVersion(api.apiUrl);
            api.version = version;
            return api.save();
        });

        await Promise.all(updatePromises);
        res.status(200).json({ message: 'API versions updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating API versions', error });
    }
});

// Initialize notifications array
let notifications = [];

// Route to fetch notifications
router.get('/notifications', (req, res) => {
    res.json(notifications.slice(-15));
});

// Function to send notifications
function sendNotification(message) {
    notifications.push({ message, timestamp: new Date() });
    // Limit the notifications array length (e.g., keep only the latest 10 notifications)
    if (notifications.length > 15) {
        notifications.shift();
    }
}

// Create a new API entry
router.post('/add-api', async (req, res) => {
    try {
        const { name, apiUrl, version } = req.body;
        if (!name || !apiUrl) {
            return res.status(400).json({ message: 'Name and API URL are required' });
        }
        const currentVersion = await fetchApiVersion(apiUrl);
        let securityStatus = 'Not Scanned';

        try {
            const response = await axios.get(apiUrl, { timeout: 5000 });
            if (response.status === 200) {
                securityStatus = 'Not Scanned';
            }
        } catch (err) {
            console.error('API validation error:', err.message);
            securityStatus = 'Insecure';
        }

        const newApi = new Api({ name, apiUrl, version: currentVersion, securityStatus });
        await newApi.save();
        sendNotification(`New API added: ${name}`);
        res.status(201).json(newApi);
    } catch (error) {
        res.status(500).json({ message: 'Error adding API entry', error });
    }
});

// Get the most recent security scans
router.get('/recent-scans', async (req, res) => {
    try {
        // Fetch the most recent scans, including API name and security status
        const scans = await Scan.find({}, 'apiName outcome') // Adjust fields as necessary
            .sort({ scanDate: -1 })
            .limit(5);
        res.json(scans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Add a new security scan (for testing/demo purposes)
router.post('/add-scan', async (req, res) => {
    const { apiName, outcome, vulnerabilities } = req.body;
    if (!apiName || !outcome) {
        return res.status(400).json({ message: 'API name and outcome are required' });
    }

    try {
        const newScan = new Scan({ apiName, outcome, vulnerabilities });
        console.log('New Scan:', newScan);
        await newScan.save();
        res.status(201).json(newScan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark an incident as resolved
router.put('/resolve-incident/:id', async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(req.params.id, { resolved: true }, { new: true });
        res.json(incident);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get API security status summary
router.get('/api-security-status', async (req, res) => {
    try {
        const securedApis = await Api.countDocuments({ securityStatus: 'Secure' });
        const notScannedApisCount = await Api.countDocuments({ securityStatus: 'Not Scanned' });
        const insecureApisCount = await Api.countDocuments({ securityStatus: 'Insecure' });

        res.json({
            securedApis: securedApis,
            notScannedApis: notScannedApisCount,
            insecureApis: insecureApisCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Initialize SSE instance
const sse = new SSE();
// Route to subscribe to scan events
router.get('/scan-events', (req, res) => {
    sse.init(req, res);
});

// Initiate a scan for a specific API
router.post('/initiate-scan/:apiId', async (req, res) => {
    const { apiId } = req.params;

    try {
        const api = await Api.findById(apiId);
        if (!api) {
            return res.status(404).json({ message: 'API not found' });
        }

        if (!api.apiUrl) {
            return res.status(400).json({ message: 'API URL is missing' });
        }
        // Notify scan initiation
        sendNotification(`Scan initiated for API: ${api.name}`);
        sse.send({ message: 'Scan initiated for API: ' + api.apiUrl }, 'scanStatus');

        console.log(`Initiating ZAP scan for API: ${api.apiUrl}`);
        const zapScanResults = await initiateZapScan(api.apiUrl);
        const scanResult = await initiateScan(api.apiUrl);
        const depCheckReportPath = await runDependencyCheck();

        api.securityStatus = scanResult.status;
        api.lastScanned = new Date();
        await api.save();

        // Generate and save a report
        const newReport = new Report({
            apiName: api.name,
            generatedAt: new Date(),
            content: `ZAP Results: ${JSON.stringify(zapScanResults)}, Dependency Check: ${depCheckReportPath}, Scan Result: ${JSON.stringify(scanResult)}`,
        });

        const scanSummary = new Scan({
            apiId: api._id,
            name: api.name,
            status: scanResult.status,
            lastScanned: api.lastScanned,
            vulnerabilities: zapScanResults,
            depCheckReport: depCheckReportPath.data,
        });
        await scanSummary.save();

        // Notify scan completion
        sse.send({ message: 'Scan completed for API: ' + api.apiUrl }, 'scanStatus');
        sendNotification(`Scan completed for API: ${api.name}`);

        console.log('Zap Scan Results:', zapScanResults);
        console.log('Scan Result:', scanResult);
        console.log('Dependency Check Report Path:', depCheckReportPath);


        res.status(200).json({ message: 'Scan completed and report generated', reportId: newReport._id });
    } catch (error) {
        console.error('Error initiating scan:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to get all reports
router.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error });
    }
});

// Endpoint to get a specific report by ID
router.get('/report/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching report content', error });
    }
});

// Endpoint to generate a new report after a scan
router.post('/generate-report', async (req, res) => {
    const { apiName, scanResults, vulnerabilities } = req.body;
    console.log('Request Body:', { apiName, scanResults, vulnerabilities });
    if (!apiName || !scanResults || !vulnerabilities) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const newReport = new Report({
            apiName,
            content: JSON.stringify({ scanResults, vulnerabilities }),
            generatedAt: new Date(),
        });
        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report', error });
    }
});

// Get scan summary by scan ID
router.get('/scan-summary/:apiId', async (req, res) => {
    const { apiId } = req.params;
    console.log(`Received API ID: ${apiId}`);
    if (!apiId) {
        return res.status(400).json({ error: 'API ID is required' });
    }
    try {
        const scanSummary = await Scan.findOne({ apiId }).sort({ lastScanned: -1 });
        if (!scanSummary) {
            return res.status(404).json({ error: 'No scan summary found' });
        }
        const formattedSummary = {
            name: scanSummary.name,
            status: scanSummary.status,
            lastScanned: scanSummary.lastScanned,
            vulnerabilities: JSON.stringify(scanSummary.vulnerabilities, null, 2),
            depCheckReport: scanSummary.depCheckReport
        };
        res.json(formattedSummary);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error('Error fetching scan summary:', err);
    }
});

// Get detailed information about a specific API by ID
router.get('/api-detail/:apiId', async (req, res) => {
    const { apiId } = req.params;

    try {
        const apiDetail = await Api.findById(apiId);

        if (!apiDetail) {
            return res.status(404).json({ message: 'API not found' });
        }

        res.json(apiDetail);
    } catch (err) {
        console.error('Error fetching API detail:', err);
        res.status(500).json({ error: 'Internal server error' });
        console.error('Error fetching API data:', error);
    }
});

// Define the route to trigger the dependency check
router.get('/run-dependency-check', async (req, res) => {
    try {
        const reportPath = await runDependencyCheck();
        res.json({ message: 'Dependency-Check report generated successfully', reportPath, data });
    } catch (error) {
        res.status(500).json({ message: 'Error generating Dependency-Check report', error: error.message });
    }
});

//endpoint to initiate a scan for all APIs stored in the database
router.post('/initiate-scan-all', async (req, res) => {
    try {
        const apis = await Api.find();

        const scanResults = await Promise.all(apis.map(async (api) => {
            if (!api.apiUrl) {
                console.warn(`Skipping API with ID ${api._id} due to missing URL.`);
                return { apiId: api._id, message: 'API URL is missing' };
            }
            // Notify scan initiation
            sse.send({ message: 'Scan initiated for API: ' + api.apiUrl }, 'scanStatus');

            console.log(`Initiating scan for API: ${api.apiUrl}`);
            const zapScanResults = await initiateZapScan(api.apiUrl);

            const apiPath = api.localPath || './';
            const result = await initiateScan(api.apiUrl);
            const depCheckReportPath = await runDependencyCheck();

            api.securityStatus = result.status;
            api.lastScanned = new Date();
            await api.save();
            // Notify scan completion
            sse.send({ message: 'Scan completed for API: ' + api.apiUrl }, 'scanStatus');


            return {
                apiId: api._id,
                name: api.name,
                status: result.status,
                vulnerabilities: zapScanResults,
                depCheckReport: depCheckReportPath.data
            };
        }));

        res.status(200).json({ message: 'Scan completed', scanResults });
    } catch (error) {
        console.error('Error initiating scans:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get scan history for a specific API
router.get('/:apiId/scans', async (req, res) => {
    const { apiId } = req.params;

    try {
        const scans = await Scan.find({ apiId }).sort({ scanDate: -1 });
        res.json(scans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get API details
router.get('/api/:id', async (req, res) => {
    try {
        const api = await Api.findById(req.params.id);
        if (!api) return res.status(404).json({ error: 'API not found' });

        res.json(api);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/api/APIdetails/:id', (req, res) => {
    const apiId = req.params.id;
    ApiModel.findById(apiId)
        .then(api => res.json(api))
        .catch(err => res.status(500).json({ error: 'Error fetching API details' }));
});

// Update API security status
router.put('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { securityStatus } = req.body;

    try {
        const updatedApi = await Api.findByIdAndUpdate(id, { securityStatus }, { new: true });
        if (!updatedApi) return res.status(404).json({ error: 'API not found' });

        res.json(updatedApi);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
