/* eslint-disable no-process-env */
const rcLoader = require('./rc-loader');
const config = {
    toc: true,
    splitByInitial: true,
    splitLimit: 20,
    title: 'Database Documentation',
    out: 'DATABASE.md'
};

// From .pg-doc.json
const opts = rcLoader.loadRcFile();
Object.assign(config, opts);

// From env
const env = {
    toc: process.env.PGDOC_TOC ? process.env.PGDOC_TOC === 'true' : null,
    connection: process.env.PGDOC_CONNECTION,
    out: process.env.PGDOC_OUT,
    title: process.env.PGDOC_TITLE,
    excluded: process.env.PGDOC_EXCLUDED ? process.env.PGDOC_EXCLUDED.split(',').map(s => s.trim()) : null,
    splitLimit: parseInt(process.env.PGDOC_SPLIT_LIMIT, 10) || null,
    splitByInitial: process.env.PGDOC_SPLIT_BY_INITIAL ? process.env.PGDOC_SPLIT_BY_INITIAL === 'true' : null
};

// Env overrides .pg-doc.json
Object.keys(env).forEach(k => {
    if (env[k] || env[k] === false) {
        config[k] = env[k];
    }
});

module.exports = config;
