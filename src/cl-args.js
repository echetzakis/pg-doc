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
    .option('no-descriptions', {
        alias: 'nd',
        demandOption: false,
        boolean: true,
        describe: 'Don\'t output table/column descriptions'
    }).option('paging-mode', {
        alias: 'pm',
        demandOption: false,
        choices: ['abc', 'count'],
        describe: 'Split output in several (pages) files based on the selected strategy'
    }).option('page-size', {
        alias: 'ps',
        demandOption: false,
        default: 20,
        type: 'number'
    })
    .help()
    .argv;

// command line arguments have the highest precedence
Object.keys(args)
    .filter(arg => ['title', 'toc', 'pagingMode', 'pageSize', 'connection', 'excluded', 'out', 'noDescriptions'].includes(arg))
    .forEach(k => {
        config[k] = args[k];
    });

module.exports = config;
