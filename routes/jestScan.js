//routes/jestScan.js
const axios = require('axios');
const token = process.env.GITHUB_TOKEN;

async function initiateScan(apiUrl) {
    try {
        const isApi = await isValidApiUrl(apiUrl);
        if (!isApi) {
            return { status: 'Insecure', message: 'The URL is not a valid API.' };
        }

        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `token ${token}`
            }
        });

        if (response.data.vulnerabilities && response.data.vulnerabilities.length > 0) {
            return { status: 'Insecure', message: 'Vulnerabilities found during the scan.' };
        }

        return { status: 'Secure', message: 'No vulnerabilities found.' };

    } catch (error) {
        console.error(`Error during scan for URL ${apiUrl}: ${error.message}`);
        if (error.response) {
            console.error(`Error Response Headers: ${JSON.stringify(error.response.headers)}`);
            console.error(`Error Response Data: ${JSON.stringify(error.response.data)}`);
        }
        if (error.code === 'ENOTFOUND' || (error.response && error.response.status === 404)) {
            return { status: 'Insecure', message: 'Invalid URL or endpoint not found.' };
        } else {
            return { status: 'Not Scanned', message: 'An error occurred during the scan.' };
        }
    }
}


async function isValidApiUrl(url) {
    try {
        const parsedUrl = new URL(url);
        const hasValidProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        const hasValidDomain = parsedUrl.hostname && parsedUrl.hostname !== '';

        if (!hasValidProtocol || !hasValidDomain) {
            console.error(`URL validation failed due to invalid protocol or domain: ${url}`);
            return false;
        }

        const response = await axios.get(url, {
            headers: {
                'Authorization': `token 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`
            },
            timeout: 10000,
        });

        console.log(`URL: ${url}, Response Headers:`, response.headers);
        console.log(`URL: ${url}, Status Code: ${response.status}`);

        const contentType = response.headers['content-type'];
        console.log(`Content-Type for ${url}: ${contentType}`);

        const isApiContentType = contentType && (
            contentType.includes('application/json') ||
            contentType.includes('application/xml') ||
            contentType.includes('text/xml') ||
            contentType.includes('text/plain')
        );

        const isHtmlContentType = contentType && contentType.includes('text/html');

        const isValidStatus = response.status >= 200 && response.status < 300;

        if (isApiContentType && !isHtmlContentType && isValidStatus) {
            console.log(`Valid API URL: ${url}`);
            return true;
        } else {
            console.error(`Invalid API URL due to content type or status: ${url}`);
            return false;
        }
    } catch (e) {
        console.error(`Error validating API URL ${url}: ${e.message}`);
        if (e.response) {
            console.error(`Validation Response Headers: ${JSON.stringify(e.response.headers)}`);
        }
        return false;
    }
}

module.exports = initiateScan;
