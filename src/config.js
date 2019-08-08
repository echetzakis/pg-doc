const path = require('path');
const configFileName = '.pg-doc.json';
const configPath = process.cwd();
const configFullPath = path.join(configPath, configFileName);
const config = {
    toc: true,
    splitByInitial: true,
    splitLimit: 20,
    title: "Database Documentation"
};

// From .pg-doc.json
try {
    let rc = require(configFullPath);
    Object.assign(config, rc);
} catch (e) {
    // don't care
}

// From env
const env = {
    splitLimit: Number.isInteger(process.env.PGDOC_SPLIT_LIMIT) ? parseInt(process.env.PGDOC_SPLIT, 10) : null,
    splitByInitial: process.env.PGDOC_SPLIT ? process.env.PGDOC_SPLIT === 'true' : null,
    title: process.env.PGDOC_TITLE,
    connection: process.env.PGDOC_CONNECTION,
    excluded: process.env.PGDOC_EXCLUDED ? process.env.PGDOC_EXCLUDED.split(',').map(s => s.trim()) : null
};

Object.keys(env).forEach(k => {
    if (env[k] || env[k] === false) {
        config[k] = env[k];
    }
});

module.exports = config;
