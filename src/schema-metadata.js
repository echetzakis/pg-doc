const knex = require('knex');

function getTables(db) {
    const config = this.config;
    let builder = db.select('tables.table_name', db.raw('obj_description((tables.table_schema || \'.\' || tables.table_name)::regclass) as description'))
        .from('information_schema.tables')
        .where('tables.table_schema', config.schema)
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
    const config = this.config;
    return db.select(
        'columns.table_name',
        'columns.column_name',
        'columns.data_type',
        'columns.udt_name',
        'columns.udt_schema',
        'columns.column_default',
        'columns.is_nullable',
        db.raw('col_description((columns.table_schema || \'.\' || columns.table_name)::regclass::oid, columns.ordinal_position) as description')
    ).from('information_schema.columns')
        .whereIn('columns.table_name', tables)
        .where('columns.table_schema', config.schema)
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

async function getUserDefinedTypes(db, types, oldTypes) {
    const config = this.config;
    const enums = await db.select(
        db.ref('pg_type.typname').as('name'),
        db.ref('pg_enum.enumlabel').as('value')
    ).from('pg_type')
        .innerJoin('pg_enum', 'pg_enum.enumtypid', 'pg_type.oid')
        .whereIn('pg_type.oid', db.raw(types.map(type => `'${type}'::regtype`)))
        .orderBy(['pg_type.typname', 'pg_enum.enumsortorder'])
        .then(rows => rows.reduce(enumsReducer, {}));

    const udtypes = await db.select(
        db.ref('pgt1.typname').as('name'),
        db.ref('pg_attribute.attname').as('property'),
        db.ref('pg_attribute.attnotnull').as('notnull'),
        db.raw('pg_attribute.attndims > 0 as array'),
        db.ref('pg_namespace.nspname').as('schema'),
        db.ref('pgt2.typname').as('type')
    ).from('pg_type as pgt1')
        .innerJoin('pg_attribute', 'pg_attribute.attrelid', 'pgt1.typrelid')
        .innerJoin('pg_type as pgt2', 'pgt2.oid', 'pg_attribute.atttypid')
        .innerJoin('pg_namespace', 'pg_namespace.oid', 'pgt2.typnamespace')
        .whereIn('pgt1.oid', db.raw(types.map(type => `'${type}'::regtype`)))
        .then(rows => rows.reduce(typesReducer, {}));

    const newTypes = [];
    Object.keys(udtypes).forEach(udt => {
        Object.keys(udtypes[udt]).forEach(prop => {
            const propName = `${udtypes[udt][prop].schema}.${udtypes[udt][prop].type}`;
            if (udtypes[udt][prop].schema === config.schema &&
                types.indexOf(propName) < 0 &&
                newTypes.indexOf(propName) < 0) {
                newTypes.push(propName);
            }
        });
    });

    if (newTypes.length > 0) {
        const newDefs = await getUserDefinedTypes(db, newTypes, types.concat(oldTypes));
        Object.assign(udtypes, newDefs.types);
        Object.assign(enums, newDefs.enums);
    }

    return { types: udtypes, enums };
}

function getUserDefinedTypesFromColumns(db, columns) {
    const config = this.config;
    const types = [];
    Object.keys(columns).forEach(table => {
        Object.keys(columns[table]).forEach(column => {
            if (columns[table][column].udt &&
                columns[table][column].udtSchema === config.schema &&
                types.indexOf(columns[table][column].type) < 0) {
                types.push(`${config.schema}.${columns[table][column].type}`);
            }
        });
    });

    return getUserDefinedTypes(db, types, []);
}

function typesReducer(mem, type) {
    let tdata = mem[type.name];
    if (!tdata) {
        mem[type.name] = tdata = {};
    }
    tdata[type.property] = {
        type: type.type.replace(/^_/, ''),
        array: type.array,
        schema: type.schema,
        nullable: !type.notnull
    };
    return mem;
}

function enumsReducer(mem, enump) {
    let values = mem[enump.name];
    if (!values) {
        mem[enump.name] = values = [];
    }
    values.push(enump.value);
    return mem;
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
    const array = current.data_type === 'ARRAY';
    const udt = current.data_type === 'USER-DEFINED' ||
        (array && current.udt_name.indexOf('_') === 0);
    const type = udt ? current.udt_name.replace(/^_/, '') : current.data_type;
    table[current.column_name] = {
        udt,
        array,
        type,
        udtSchema: udt ? current.udt_schema : undefined,
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

async function schemaMetadata({ connection, schema, excluded, descriptions }) {
    this.config = { schema, excluded, descriptions };
    const db = knex({
        client: 'pg',
        connection
    });
    const tables = await getTables(db);
    const columns = await getColumns(db, Object.keys(tables));
    const constraints = await getConstraints(db);
    const { enums, types } = await getUserDefinedTypesFromColumns(db, columns);
    db.destroy();
    return merge(tables, columns, constraints, enums, types);
}

function merge(tables, columns, constraints, enums, types) {
    Object.keys(tables).forEach(table => {
        tables[table].columns = columns[table];
        Object.keys(tables[table].columns).forEach(column => {
            if (constraints[table][column]) {
                tables[table].columns[column].constraints = constraints[table][column];
            }
        });
    });
    return { tables, enums, types };
}

module.exports = schemaMetadata;
