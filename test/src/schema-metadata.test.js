/* eslint-disable no-process-env */
const sandbox = require('sinon').createSandbox();

describe('schema metadata test', () => {
    beforeEach(() => {
        delete require.cache[require.resolve('../../src/config')];
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('schemaMetadata', () => {
        it('should return the metadata from postgres', () => {
            const config = require('../../src/config');
            config.connection = 'http://localhost:5432/pgdoc_test';
            config.excluded = ['migrations', 'migrations_lock'];
            const schemaMetadata = require('../../src/schema-metadata');
            return schemaMetadata().then(schemaMetadata => {
                schemaMetadata.should.be.eql(fixtures.schema.test);
            });
        });
    });
});
