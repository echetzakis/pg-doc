
const table = 'table1';

exports.up = function (knex, Promise) {
    return knex.schema.createTable(table, t => {
        t.comment('This is the description for table 1');

        t.increments('id').primary()
            .comment('This is the id (PK) column');

        t.string('name')
            .comment('This is the name column');

        t.enu('rank', ['one', 'two', 'three'], { useNative: true, enumName: 'table1_enum1' })
            .notNull()
            .defaultTo('one')
            .comment('An enumerated rank column')

        t.jsonb('data')
            .notNull()
            .defaultTo('{"empty":true}')
            .comment('This is a data (json) column');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists(table)
        .raw('DROP TYPE table1_enum1');
};
