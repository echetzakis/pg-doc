/* eslint-disable no-process-env */
const path = require('path');
const fs = require('fs');
const configFullPath = path.join(process.cwd(), '.pg-doc.json');

function loadRcFile() {
    try {
        // eslint-disable-next-line no-sync
        const file = fs.readFileSync(configFullPath);
        return JSON.parse(file);
    } catch (e) {
        return {};
    }
}

module.exports.loadRcFile = loadRcFile;
