const { Writable } = require('stream');
const { readFileSync } = require('fs');
const path = require('path');
const sandbox = require('sinon').createSandbox();
const dot = require('../../../src/renderers/dot');

describe('dot render test', () => {
    beforeEach(() => {
        // initialize your mocks
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('when render is called', () => {
        it('should write dot notation on output stream', ()=>{
            assertOutput();
        });
    });
});

function assertOutput() {
    let buffer = [];
    const streamMock = new Writable({
        write(chunk, encoding, callback) {
            buffer.push(chunk.toString());
            callback();
        }
    });
    const file = path.join(process.cwd(), `/test/fixtures/dot/default.dot`);
    const expected = readFileSync(file).toString();
    const context = Object.assign({ stream: streamMock }, fixtures.schema.test);
    dot(context);
    buffer.join('').should.equal(expected);
}
