const { Writable } = require('stream');
const { readFileSync } = require('fs');
const path = require('path');
const sandbox = require('sinon').createSandbox();
const writeDoc = require('../../src/md-writer');
const config = require('../../src/config');

describe('writer test', () => {
    beforeEach(() => {
        // initialize your mocks
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('writeDoc', () => {
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
        describe('with toc by initial', () => {
            it('should produce the expected markdown with custom title', () => {
                sandbox.replace(config, 'splitByInitial', true);
                sandbox.replace(config, 'splitLimit', 0);
                assertOutput('toc-by-initial');
            });
        });
        describe('without toc', () => {
            it('should produce the expected markdown with custom title', () => {
                sandbox.replace(config, 'toc', false);
                assertOutput('no-toc');
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
    writeDoc(context);
    buffer.join('').should.equal(expected);
}
