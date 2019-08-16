/* eslint-disable no-process-env */
const rcLoader = require('./rc-loader');
const config = {
    noDescriptions: false,
    toc: true,
    pageSize: 20,
    title: 'Database Documentation',
    out: 'DATABASE.md'
};

// From .pg-doc.json
const opts = rcLoader.loadRcFile();
Object.assign(config, opts);

// From env
const env = {
    noDescriptions: process.env.PGDOC_NO_DESCRIPTIONS ? process.env.PGDOC_NO_DESCRIPTIONS === 'true' : false,
    toc: process.env.PGDOC_TOC ? process.env.PGDOC_TOC === 'true' : null,
    connection: process.env.PGDOC_CONNECTION,
    out: process.env.PGDOC_OUT,
    title: process.env.PGDOC_TITLE,
    excluded: process.env.PGDOC_EXCLUDED ? process.env.PGDOC_EXCLUDED.split(',').map(s => s.trim()) : null,
    pageSize: parseInt(process.env.PGDOC_PAGE_SIZE, 10) || null,
    pagingMode: ['abc', 'count'].includes(process.env.PGDOC_PAGING_MODE) ? process.env.PGDOC_PAGING_MODE : null
};

// Env overrides .pg-doc.json
Object.keys(env).forEach(k => {
    if (env[k] || env[k] === false) {
        config[k] = env[k];
    }
});

module.exports = config;
