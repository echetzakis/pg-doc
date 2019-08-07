const schemaMetadata = require('./schema-metadata');
const writeDoc = require('./md-writer');
const fs = require('fs');

async function createDoc() {
    const context = await schemaMetadata();
    context.stream = fs.createWriteStream('DATABASE.md');
    writeDoc(context);
    report(context);
}


function report(context) {
    const tables = Object.keys(context.tables);
    const columns = tables.map(name => Object.keys(context.columns[name]).length).reduce((sum, count) => sum + count);
    // const constraints = tables.map(name => Object.keys(context.constraints[name])).map(cols => cols.reduce((sum, count)=>{ }) ).reduce((sum, count) => sum + count);
    console.log('Created documentation for:');
    console.log(` * ${tables.length} - Tables`);
    console.log(` * ${columns} - Columns`);
}

createDoc()
    .catch(console.error);
