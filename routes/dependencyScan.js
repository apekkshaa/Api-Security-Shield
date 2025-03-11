const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

function runDependencyCheck(apiPath) {
    return new Promise((resolve, reject) => {
        const reportsDir = path.resolve(__dirname, '../reports');
        const outputFilePath = path.join(reportsDir, 'dependency-check-report.json');

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const command = `dependency-check ${apiPath} --format JSON --out ${outputFilePath}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Dependency-Check failed: ${stderr}`);
                reject({ status: 'Insecure', message: 'Dependency-Check failed.' });
            } else {
                fs.readFile(outputFilePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(`Failed to read the generated file: ${err}`);
                        reject({ status: 'Insecure', message: 'Dependency-Check failed.' });
                    } else {
                        console.log(`Dependency-Check report generated at ${outputFilePath}`);
                        resolve({
                            reportPath: outputFilePath,
                            data: JSON.parse(data)
                        });
                    }
                });
            }
        });
    });
}


module.exports = runDependencyCheck;
