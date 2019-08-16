function pager({ title, filename, schema }) {
    const pages = [];
    const baseFname = splitFilename(filename);
    const tables = Object.keys(schema.tables).sort();
    let initial = tables[0][0].toUpperCase();
    let page = { title: `${title} [${initial}]`, filename: `${baseFname.base}_${initial}${baseFname.ext}`, schema: { tables: {} } };
    tables.forEach(table => {
        const newInitial = table[0].toUpperCase();
        if (newInitial !== initial) {
            initial = newInitial;
            pages.push(page);
            page = { title: `${title} [${newInitial}]`, filename: `${baseFname.base}_${newInitial}${baseFname.ext}`, schema: { tables: {} } };
        }
        page.schema.tables[table] = schema.tables[table];
    });
    return pages;
}

function splitFilename(filename) {
    const parts = filename.split('.');
    let ext;
    if (parts.length > 1) {
        ext = parts.pop();
    }
    return { base: parts.join('.'), ext: `.${ext}` || '' };
}

module.exports = pager;
