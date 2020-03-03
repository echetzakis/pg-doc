/* eslint-disable no-sync */
const fs = require('fs');

function checkPath(path) {
    try {
        const stats = fs.lstatSync(path);
        return stats.isDirectory() ? 'dir' : 'other';
    } catch (e) {
        return 'not-exist';
    }
}

function mkDir(path) {
    if (!path) {
        return process.cwd;
    }
    const result = checkPath(path);
    if (result === 'dir') {
        return path;
    }
    if (result === 'other') {
        throw new Error(`${path} is not a directory`);
    }
    fs.mkdirSync(path, { recursive: true });
    return path;
}

module.exports = { mkDir };
