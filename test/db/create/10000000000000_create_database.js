
const database = 'pgdoc_test';

exports.up = function (knex, Promise) {
    return knex.raw(`CREATE DATABASE ${database};`);
};

exports.down = function (knex, Promise) {
    return knex.raw(`DROP DATABASE IF EXISTS ${database};`);
};

exports.config = { transaction: false };
