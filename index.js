const knex = require('knex');
const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL
});

function getTables() {
    const excluded = ['schema_version', 'migrations', 'migrations_lock', 'dropped_foreign_keys'];
    return db.select('tables.table_name', db.raw('obj_description(tables.table_name::regclass) as description'))
        .from('information_schema.tables')
        .where('tables.table_schema', 'public')
        .where('tables.table_type', 'BASE TABLE')
        .whereNotIn('tables.table_name', excluded)
        .orderBy('tables.table_name', 'asc')
        .then(rows => rows.reduce(tableReducer, {}));
}

function tableReducer(mem, tab) {
    mem[tab.table_name] = { description: tab.description || '' };
    return mem;
}

function getColumns(tables) {
    return db.select(
        'columns.table_name',
        'columns.column_name',
        'columns.data_type',
        'columns.column_default',
        'columns.is_nullable',
        db.raw('col_description(columns.table_name::regclass::oid, columns.ordinal_position) as description')
    ).from('information_schema.columns')
        .whereIn('columns.table_name', tables)
        .orderBy(['columns.table_name', 'columns.column_name'])
        .then(rows => rows.reduce(columnReducer, {}));
}

function getConstraints() {
    return db.select(
        db.ref('key_column_usage.table_name').as('src_tab'),
        db.ref('key_column_usage.column_name').as('src_col'),
        db.ref('table_constraints.constraint_type').as('type'),
        db.ref('constraint_column_usage.table_name').as('dest_tab'),
        db.ref('constraint_column_usage.column_name').as('dest_col'),
    ).from('information_schema.key_column_usage')
        .leftJoin('information_schema.table_constraints', 'table_constraints.constraint_name', 'key_column_usage.constraint_name')
        .leftJoin('information_schema.constraint_column_usage', 'constraint_column_usage.constraint_name', 'key_column_usage.constraint_name')
        .whereIn('table_constraints.constraint_type', ['FOREIGN KEY', 'UNIQUE', 'PRIMARY KEY'])
        .orderBy(['key_column_usage.table_name', 'key_column_usage.column_name'])
        .then(rows => rows.reduce(constraintsReducer, {}));
}


function constraintsReducer(mem, cons) {
    let tab = mem[cons.src_tab];
    if (!tab) {
        mem[cons.src_tab] = tab = { columns: {} };
    }
    let col = tab.columns[cons.src_col];
    if (!col) {
        tab.columns[cons.src_col] = col = { constraints: { } };
    }
    switch (cons.type) {
        case 'UNIQUE':
            col.constraints.unq = true;
            break;
        case 'PRIMARY KEY':
            col.constraints.pk = true;
            break;
        case 'FOREIGN KEY':
            col.constraints.fk = { table: cons.dest_tab, column: cons.dest_col };
            break;
    }
    return mem;
}

function columnReducer(mem, current) {
    let table = mem[current.table_name];
    if (!table) {
        mem[current.table_name] = table = { columns: {} };
    }
    table.columns[current.column_name] = {
        type: current.data_type,
        nullable: current.is_nullable,
        default: current.column_default,
        description: current.description || ''
    };
    return mem;
}

async function pgDoc() {
    const tables = await getTables();
    console.log(tables);
    const columns = await getColumns(Object.keys(tables));
    console.log(JSON.stringify(columns, null, 2));
    const constraints = await getConstraints();
    console.log(JSON.stringify(constraints, null, 2));
}

module.exports = pgDoc;
