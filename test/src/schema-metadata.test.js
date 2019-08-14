/* eslint-disable no-process-env */
const sandbox = require('sinon').createSandbox();

describe('schema metadata test', () => {
    beforeEach(() => {
        delete require.cache[require.resolve('../../src/config')];
        delete require.cache[require.resolve('../../src/schema-metadata')];
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('schemaMetadata', () => {
        it('should return the metadata from postgres', () => {
            const config = require('../../src/config');
            config.connection = 'http://localhost:5432/pgdoc_test';
            config.excluded = ['migrations', 'migrations_lock'];
            config.descriptions = null;
            const schemaMetadata = require('../../src/schema-metadata');
            return schemaMetadata().then(schemaMetadata => {
                schemaMetadata.should.be.eql(fixtures.schema.test);
            });
        });
    });
    describe('when configuration contains descriptions', () => {
        it('should override postgres table/column comments with the provided ones', () => {
            const config = require('../../src/config');
            config.connection = 'http://localhost:5432/pgdoc_test';
            config.excluded = ['migrations', 'migrations_lock'];
            config.descriptions = {
                table1: 'Configured description for table 1',
                table2: 'Configured description for table 2',
                'table1.id': 'Configured table1.id description',
                'table1.name': 'Configured table1.name description',
                'table1.rank': 'Configured table1.rank description',
                'table1.data': 'Configured table1.data description'
            };
            const schemaMetadata = require('../../src/schema-metadata');
            return schemaMetadata().then(foo => {
                foo.should.be.eql(fixtures.schema['custom-descriptions']);
            });
        });
    });
});
