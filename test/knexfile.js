/* eslint-disable no-process-env */
module.exports = {
    admin:{
        client: 'pg',
        connection: process.env.DATABASE_ADMIN_URL || 'http://localhost:5432/postgres',
        migrations: {
            directory: './db/create',
            tableName: 'migrations'
        }
    },
    test:{
        client: 'pg',
        connection: process.env.DATABASE_URL || 'http://localhost:5432/pgdoc_test',
        migrations: {
            directory: './db/migrations',
            tableName: 'migrations'
        }
    }
};
