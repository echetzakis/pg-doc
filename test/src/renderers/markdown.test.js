const { Writable } = require('stream');
const { readFileSync } = require('fs');
const path = require('path');
const sandbox = require('sinon').createSandbox();
const proxyquire = require('proxyquire');
const markdown = proxyquire('../../../src/renderers/markdown', { '../../package.json': {version: '1.0.0'} });
const config = require('../../../src/config');

describe('writer test', () => {
    beforeEach(() => {

    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('markdown', () => {
        describe('with default config ', () => {
            it('should produce the expected markdown', () => {
                assertOutput();
            });
        });
        describe('with custom title', () => {
            it('should produce the expected markdown with custom title', () => {
                sandbox.replace(config, 'title', 'Custom Title');
                assertOutput('custom-title');
            });
        });
       
        describe('without toc', () => {
            it('should produce the expected markdown with custom title', () => {
                sandbox.replace(config, 'toc', false);
                assertOutput('no-toc');
            });
        });
        describe('without descriptions', () => {
            it('should produce the expected markdown with table/column descriptions', () => {
                sandbox.replace(config, 'noDescriptions', true);
                assertOutput('no-descr');
            });
        });
    });
});

function assertOutput(name = 'default') {
    let buffer = [];
    const streamMock = new Writable({
        write(chunk, encoding, callback) {
            buffer.push(chunk.toString());
            callback();
        }
    });
    const file = path.join(process.cwd(), `/test/fixtures/output/${name}.md`);
    const expected = readFileSync(file).toString();
    const context = Object.assign({ stream: streamMock }, fixtures.schema.test);
    markdown(context);
    buffer.join('').should.equal(expected);
}
