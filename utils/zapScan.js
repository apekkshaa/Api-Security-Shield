// utils/zapScan.js
const axios = require('axios');
axios.defaults.timeout = 120000;

async function initiateZapScan(targetUrl) {
    const ZAP_BASE_URL = 'http://localhost:8080';
    const API_KEY = 'une6325h976jv1p7hcqf63gu8f';

    try {
        console.log(`Starting spider scan for URL: ${targetUrl}`);
        //spider scan
        const spiderResponse = await axios.get(`${ZAP_BASE_URL}/JSON/spider/action/scan/`, {
            params: {
                url: targetUrl,
                apikey: API_KEY
            }
        });
        const scanId = spiderResponse.data.scan;
        console.log(`Spider scan initiated with Scan ID: ${scanId}`);
        //spider scan status
        let status;
        do {
            const statusResponse = await axios.get(`${ZAP_BASE_URL}/JSON/spider/view/status/`, {
                params: {
                    scanId,
                    apikey: API_KEY
                }
            });
            status = parseInt(statusResponse.data.status, 10);
            console.log(`Spider scan status: ${status}%`);
            await new Promise(resolve => setTimeout(resolve, 10000));
        } while (status < 100);

        console.log('Spider scan completed. Starting active scan.');
        //active scan
        const activeScanResponse = await axios.get(`${ZAP_BASE_URL}/JSON/ascan/action/scan/`, {
            params: {
                url: targetUrl,
                apikey: API_KEY
            }
        });
        const activeScanId = activeScanResponse.data.scan;
        console.log(`Active scan initiated with Scan ID: ${activeScanId}`);
        //active scan status
        do {
            const statusResponse = await axios.get(`${ZAP_BASE_URL}/JSON/ascan/view/status/`, {
                params: {
                    scanId: activeScanId,
                    apikey: API_KEY
                }
            });
            status = parseInt(statusResponse.data.status, 10);
            console.log(`Active scan status: ${status}%`);
            await new Promise(resolve => setTimeout(resolve, 10000));
        } while (status < 100);

        console.log('Active scan completed. Retrieving scan results.');
        //scan result
        const resultsResponse = await axios.get(`${ZAP_BASE_URL}/JSON/core/view/alerts/`, {
            params: {
                baseurl: targetUrl,
                apikey: API_KEY
            }
        });
        console.log('Scan results retrieved successfully.');
        const alerts = resultsResponse.data.alerts;

        if (alerts && alerts.length > 0) {
            console.log('Vulnerabilities detected:', alerts.length);
            return {
                status: 'Insecure',
                message: `${alerts.length} vulnerabilities detected.`,
                alerts
            };
        } else {
            console.log('No vulnerabilities detected.');
            return {
                status: 'Secure',
                message: 'No vulnerabilities detected.'
            };
        }

    } catch (error) {
        console.error('Error initiating ZAP scan:', error.message);
        if (error.response) {
            console.error('HTTP Status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error details:', error);
        }
        return { status: 'Insecure', message: 'Error initiating ZAP scan.' };
    }
}

module.exports = initiateZapScan;
