const sandbox = require('sinon').createSandbox();

describe('command line test', () => {
    const args = ['--connection', 'CLI_CONNECTION'];
    beforeEach(() => {
        args.forEach(_ => process.argv.push(_));
        delete require.cache[require.resolve('../../src/cl-args')];
        delete require.cache[require.resolve('../../src/config')];
        delete require.cache[require.resolve('yargs')];
    });
    afterEach(() => {
        sandbox.restore();
        args.forEach(_ => process.argv.pop());
    });
    describe('when no optional args given', () => {
        it('should not modify the default config', () => {
            const config = require('../../src/cl-args');
            config.should.be.eql(fixtures.argv.base);
        });
    });

    describe('when some optional args given', () => {
        const args = ['--out', 'CLI_OUT', '--title', 'CLI_TITLE'];
        beforeEach(() => {
            args.forEach(_ => process.argv.push(_));
        });
        afterEach(() => {
            args.forEach(_ => process.argv.pop());
        });
        it('should override the defaults', () => {
            const config = require('../../src/cl-args');
            config.should.be.eql(fixtures.argv.partial);
        });
    });

    describe('when all optional args given', () => {
        const args = ['--o', 'CLI_OUT', '--t', 'CLI_TITLE', '--ex', 'CLI_EX_1', 'CLI_EX_2', '--toc', 'false', '--s', 'false', '--sl', '101'];
        beforeEach(() => {
            args.forEach(_ => process.argv.push(_));
        });
        afterEach(() => {
            args.forEach(_ => process.argv.pop());
        });
        it('should override the defaults', () => {
            const config = require('../../src/cl-args');
            config.should.be.eql(fixtures.argv.full);
        });
    });
});
