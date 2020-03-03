const yargs = require('yargs');
const config = require('./config');
const { mkDir } = require('./dir-util');

yargs
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
        describe: 'Output path (defaults to current directory)'
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
    .option('no-descriptions', {
        alias: 'nd',
        demandOption: false,
        boolean: true,
        describe: 'Don\'t output table/column descriptions'
    })
    .check(check, true)
    .help()
    .argv;

function check(argv) {
    // command line arguments have the highest precedence
    Object.keys(argv)
        .filter(arg => ['title', 'connection', 'excluded', 'out', 'noDescriptions'].includes(arg))
        .forEach(k => {
            config[k] = argv[k];
        });
    config.out = mkDir(config.out);
    return true;
}

module.exports = config;
