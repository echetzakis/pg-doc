#!/usr/bin/env node

const fs = require('fs');
const timeSpan = require('time-span');
const schemaMetadata = require('../src/schema-metadata');
const markdown = require('../src/renderers/markdown');
const config = require('../src/cl-args');

async function createDoc() {
    const context = await schemaMetadata();
    context.stream = fs.createWriteStream(config.out);
    markdown(context);
    report(context);
}

function report(context) {
    const tables = Object.keys(context.tables);
    const columns = tables.map(name => Object.keys(context.columns[name]).length).reduce((sum, count) => sum + count);
    console.log('Created documentation for:');
    console.log(` * ${tables.length} - Tables`);
    console.log(` * ${columns} - Columns`);
    console.log(`generated in ${time.rounded()} milliseconds`);
}

const time = timeSpan();
createDoc()
    .catch(e => console.error(e.message));
