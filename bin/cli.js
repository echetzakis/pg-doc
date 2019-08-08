const schemaMetadata = require('../src/schema-metadata');
const writeDoc = require('../src/md-writer');
const fs = require('fs');
const config = require('../src/cl-args');

async function createDoc() {
    const context = await schemaMetadata();
    context.stream = fs.createWriteStream(config.out);
    writeDoc(context);
    report(context);
}

function report(context) {
    const tables = Object.keys(context.tables);
    const columns = tables.map(name => Object.keys(context.columns[name]).length).reduce((sum, count) => sum + count);
    console.log('Created documentation for:');
    console.log(` * ${tables.length} - Tables`);
    console.log(` * ${columns} - Columns`);
}

createDoc()
    .catch(console.error);
