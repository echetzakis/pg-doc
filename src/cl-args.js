const yargs = require('yargs');
const config = require('./config');

const args = yargs
    .scriptName('pg-doc')
    .usage('Usage: $0 [options]')
    .option('connection', {
        alias: 'db',
        demandOption: !config.connection,
        type: 'string',
        describe: 'Database Connection URL'
    })
    .option('out', {
        alias: 'o',
        demandOption: !config.out,
        type: 'string',
        describe: 'The file name of the output'
    })
    .option('title', {
        alias: 't',
        demandOption: false,
        type: 'string',
        describe: 'The title of the document'
    })
    .option('excluded', {
        alias: 'ex',
        demandOption: false,
        array: true,
        describe: 'Tables to be excluded'
    })
    .option('toc', {
        boolean: true,
        demandOption: false,
        default: true,
        describe: 'Add a table of contents (TOC) section'
    })
    .option('split-by-initial', {
        alias: 's',
        boolean: true,
        demandOption: false,
        describe: 'Split TOC by initial letter'
    })
    .option('split-limit', {
        alias: 'sl',
        demandOption: false,
        type: 'number',
        default: 20,
        describe: 'Split TOC only if number of tables is greater that this limit'
    })
    .help()
    .argv;

// command line arguments have the highest precedence
Object.keys(args)
    .filter(arg => ['title', 'toc', 'splitByInitial', 'splitLimit', 'connection', 'excluded', 'out'].includes(arg))
    .forEach(k => {
        config[k] = args[k];
    });

module.exports = config;
