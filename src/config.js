/* eslint-disable no-process-env */
const rcLoader = require('./rc-loader');
const config = {
    noDescriptions: false,
    title: 'Database Documentation',
    out: process.cwd()
};

// From .pg-doc.json
const opts = rcLoader.loadRcFile();
Object.assign(config, opts);

// From env
const env = {
    noDescriptions: process.env.PGDOC_NO_DESCRIPTIONS ? process.env.PGDOC_NO_DESCRIPTIONS === 'true' : false,
    connection: process.env.PGDOC_CONNECTION,
    out: process.env.PGDOC_OUT,
    title: process.env.PGDOC_TITLE,
    excluded: process.env.PGDOC_EXCLUDED ? process.env.PGDOC_EXCLUDED.split(',').map(s => s.trim()) : null
};

// Env overrides .pg-doc.json
Object.keys(env).forEach(k => {
    if (env[k] || env[k] === false) {
        config[k] = env[k];
    }
});

module.exports = config;
