#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const timeSpan = require('time-span');
const schemaMetadata = require('../src/schema-metadata');
const markdown = require('../src/renderers/markdown');
const graphviz = require('../src/renderers/dot');
const config = require('../src/cl-args');

const time = timeSpan();

async function createDoc() {
    const context = await schemaMetadata(config);
    const md = path.join(config.out, 'DATABASE.md');
    const dot = path.join(config.out, 'graph.dot');
    // context.stream = fs.createWriteStream(md);
    // markdown(context);
    context.stream = fs.createWriteStream(dot);
    graphviz(context);
    report(context);
}

function report(context) {
    const tables = Object.keys(context.tables);
    // const columns = tables.map(name => Object.keys(context.columns[name]).length).reduce((sum, count) => sum + count);
    console.log('Created documentation for:');
    console.log(` * ${tables.length} - Tables`);
    // console.log(` * ${columns} - Columns`);
    console.log(`generated in ${time.rounded()} milliseconds`);
}

createDoc()
    .catch(e => console.error(e));
