/* eslint-disable no-process-env */
const sandbox = sinon.createSandbox();
const rcLoader = require('../../src/rc-loader');
const defaults = {
    noDescriptions: false,
    toc: true,
    splitByInitial: true,
    splitLimit: 20,
    title: 'Database Documentation',
    out: 'DATABASE.md'
};
const envDefaults = {
    PGDOC_NO_DESCRIPTIONS: true,
    PGDOC_TOC: false,
    PGDOC_CONNECTION: 'PGDOC_CONNECTION',
    PGDOC_OUT: 'PGDOC_OUT',
    PGDOC_TITLE: 'PGDOC_TITLE',
    PGDOC_EXCLUDED: 'PGDOC_EXCLUDED_1, PGDOC_EXCLUDED_2',
    PGDOC_SPLIT_LIMIT: '100',
    PGDOC_SPLIT_BY_INITIAL: 'false'
};

describe('config test', () => {
    beforeEach(() => {
        delete require.cache[require.resolve('../../src/config')];
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('when rc file exist', () => {
        describe('when all options defined', () => {
            it('should override all options', () => {
                sandbox.stub(rcLoader, 'loadRcFile').returns(fixtures.opts.full);
                const config = require('../../src/config');
                config.should.be.eql(fixtures.opts.full);
            });
        });
        describe('when some options defined', () => {
            it('should override only provided options', () => {
                sandbox.stub(rcLoader, 'loadRcFile').returns(fixtures.opts.partial);
                const expected = Object.assign({}, defaults, fixtures.opts.partial);
                const config = require('../../src/config');
                config.should.be.eql(expected);
            });
        });
    });

    describe('when env variables are set', () => {
        afterEach(() => {
            unmockEnv();
        });
        describe('when all options defined', () => {
            it('should replace defaults', () => {
                mockEnv(envDefaults);
                const config = require('../../src/config');
                config.should.be.eql(fixtures.env.full);
            });
        });
        describe('when some options defined', () => {
            it('should override only provided options', () => {
                const opts = {
                    PGDOC_CONNECTION: 'PGDOC_CONNECTION',
                    PGDOC_OUT: 'PGDOC_OUT',
                    PGDOC_TITLE: 'PGDOC_TITLE'
                };
                mockEnv(opts);
                const config = require('../../src/config');
                config.should.be.eql(fixtures.env.partial);
            });
        });
    });
});

function mockEnv(opts) {
    const vars = Object.assign({}, opts);
    Object.keys(vars).forEach(variable => {
        process.env[variable] = vars[variable];
    });
}

function unmockEnv() {
    Object.keys(envDefaults).forEach(variable => {
        delete process.env[variable];
    });
}
