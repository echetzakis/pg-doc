
const table = 'table2';

exports.up = function (knex, Promise) {
    return knex.schema.createTable(table, t => {
        t.comment('This is the description for table 2');

        t.increments('id').primary()
            .comment('This is the id (PK) column');

        t.string('email')
            .unique()
            .comment('This is the email column');

        t.integer('table1_id')
            .references('id')
            .inTable('table1')
            .comment('This foreign key referencing table 1');

        t.integer('age')
            .unsigned()
            .notNull()
            .comment('This is the age column');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists(table);
};
