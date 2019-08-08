const path = require('path');
const configFileName = '.pg-doc.json';
const configPath = process.cwd();
const configFullPath = path.join(configPath, configFileName);
const config = {
    toc: true,
    splitByInitial: true,
    splitLimit: 20,
    title: "Database Documentation",
    out: "DATABASE.md"
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
    connection: process.env.PGDOC_CONNECTION,
    out: process.env.PGDOC_OUT,
    title: process.env.PGDOC_TITLE,
    excluded: process.env.PGDOC_EXCLUDED ? process.env.PGDOC_EXCLUDED.split(',').map(s => s.trim()) : null,
    splitLimit: Number.isInteger(process.env.PGDOC_SPLIT_LIMIT) ? parseInt(process.env.PGDOC_SPLIT, 10) : null,
    splitByInitial: process.env.PGDOC_SPLIT_BY_INITIAL ? process.env.PGDOC_SPLIT_BY_INITIAL === 'true' : null
};

// Env overrides .pg-doc.json
Object.keys(env).forEach(k => {
    if (env[k] || env[k] === false) {
        config[k] = env[k];
    }
});

module.exports = config;
