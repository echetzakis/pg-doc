const knex = require('knex');

function getTables(db) {
    const config = this.config;
    let builder = db.select('tables.table_name', db.raw('obj_description(tables.table_name::regclass) as description'))
        .from('information_schema.tables')
        .where('tables.table_schema', 'public')
        .where('tables.table_type', 'BASE TABLE')
        .orderBy('tables.table_name', 'asc');

    if (Array.isArray(config.excluded) && config.excluded.length > 0) {
        builder = builder.whereNotIn('tables.table_name', config.excluded);
    }

    return builder.then(rows => rows.reduce(tableReducer, {}));
}

function tableReducer(mem, tab) {
    const description = resolveDescription(tab.table_name, tab.description);
    mem[tab.table_name] = { description };
    return mem;
}

function getColumns(db, tables) {
    return db.select(
        'columns.table_name',
        'columns.column_name',
        'columns.data_type',
        'columns.udt_name',
        'columns.column_default',
        'columns.is_nullable',
        db.raw('col_description(columns.table_name::regclass::oid, columns.ordinal_position) as description')
    ).from('information_schema.columns')
        .whereIn('columns.table_name', tables)
        .orderBy(['columns.table_name', 'columns.ordinal_position'])
        .then(rows => rows.reduce(columnReducer, {}));
}

function getConstraints(db) {
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
        mem[cons.src_tab] = tab = {};
    }
    let col = tab[cons.src_col];
    if (!col) {
        tab[cons.src_col] = col = {};
    }
    switch (cons.type) {
        case 'UNIQUE':
            col.unq = true;
            break;
        case 'PRIMARY KEY':
            col.pk = true;
            break;
        case 'FOREIGN KEY':
            col.fk = { table: cons.dest_tab, column: cons.dest_col };
            break;
    }
    return mem;
}

function columnReducer(mem, current) {
    let table = mem[current.table_name];
    if (!table) {
        mem[current.table_name] = table = {};
    }
    const udt = current.data_type === 'USER-DEFINED';
    const type = udt ? current.udt_name : current.data_type;
    table[current.column_name] = {
        udt,
        type,
        nullable: current.is_nullable,
        default: resolveDefaultValue(current.column_default),
        description: resolveDescription(current.table_name, current.column_name, current.description)
    };
    return mem;
}

function resolveDescription(...args) {
    const config = this.config;
    let [table, col, pgDesc] = args;
    if (args.length === 2) {
        pgDesc = col;
        col = null;
    }
    const name = col ? `${table}.${col}` : table;
    let confDesc = config.descriptions ? config.descriptions[name] : null;
    return confDesc || pgDesc || '';
}

function resolveDefaultValue(defaultValue) {
    if (!defaultValue) {
        return defaultValue;
    }
    // nextval
    if (defaultValue.startsWith('nextval')) {
        return 'auto-increment';
    }
    // value::type
    const parts = defaultValue.split('::');
    if (parts.length === 2) {
        return parts[0];
    }
    return defaultValue;
}

async function schemaMetadata({ connection, excluded, descriptions }) {
    this.config = { excluded, descriptions };
    const db = knex({
        client: 'pg',
        connection
    });
    const tables = await getTables(db);
    const columns = await getColumns(db, Object.keys(tables));
    const constraints = await getConstraints(db);
    db.destroy();
    return merge(tables, columns, constraints);
}

function merge(tables, columns, constraints) {
    Object.keys(tables).forEach(table => {
        tables[table].columns = columns[table];
        Object.keys(tables[table].columns).forEach(column => {
            if (constraints[table] && constraints[table][column]) {
                tables[table].columns[column].constraints = constraints[table][column];
            }
        });
    });
    return { tables };
}

module.exports = schemaMetadata;
