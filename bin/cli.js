#!/usr/bin/env node

const fs = require('fs');
const timeSpan = require('time-span');
const schemaMetadata = require('../src/schema-metadata');
const markdown = require('../src/renderers/markdown');
const config = require('../src/cl-args');

async function createDoc() {
    const schema = await schemaMetadata(config);
    paging(schema).forEach(createPage);
    report(schema);
}

function createPage(page) {
    page.stream = fs.createWriteStream(page.filename);
    markdown(page);
}

function paging(schema) {
    const context = { title: config.title, filename: config.out, schema };
    if (!config.pagingMode) {
        return [context];
    }
    const strategy = require(`../src/pagers/${config.pagingMode}`);
    return strategy(context);
}

function report(schema) {
    const tables = Object.keys(schema.tables);
    // const columns = tables.map(name => Object.keys(context.columns[name]).length).reduce((sum, count) => sum + count);
    console.log('Created documentation for:');
    console.log(` * ${tables.length} - Tables`);
    // console.log(` * ${columns} - Columns`);
    console.log(`generated in ${time.rounded()} milliseconds`);
}

const time = timeSpan();
createDoc()
    .catch(e => console.error(e));
