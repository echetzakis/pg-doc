const { version } = require('../../package.json');
const config = require('../config');

function render(context) {
    header(context);
    toc(context);
    details(context);
    footer(context);
}

function header({ stream }) {
    const title = config.title;
    stream.write(`# ${title}\n`);
}

function toc({ stream, tables, types, enums }) {
    if (!config.toc) {
        return;
    }
    let i = 1;
    const names = Object.keys(tables).sort();
    let initial = names[0][0].toUpperCase();
    const splitByInitial = config.splitByInitial && names.length > config.splitLimit;
    stream.write('## Tables \n');
    if (splitByInitial) {
        navBar(stream, names);
    }
    tocHeader(stream, splitByInitial, initial);
    names.forEach(name => {
        let newInitial = name[0].toUpperCase();
        if (splitByInitial && initial !== newInitial) {
            initial = newInitial;
            tocHeader(stream, splitByInitial, initial);
        }
        stream.write(`|${i}| [${name}](#${name}) |`);
        if (!config.noDescriptions) {
            stream.write(` ${tables[name].description} |`);
        }
        stream.write('\n');
        i++;
    });
}

function navBar(stream, names) {
    stream.write(names.map(name => name[0].toUpperCase()).reduce((initials, letter) => {
        if (!initials.includes(letter)) {
            initials.push(letter);
        }
        return initials;
    }, []).map(initial => `[${initial}](#${initial})`).join(' \\| '));
    stream.write('\n');
}

function tocHeader(stream, splitByInitial, initial) {
    if (splitByInitial) {
        stream.write(`### ${initial} \n`);
    }
    if (config.noDescriptions) {
        stream.write('|\# |Table Name|\n|--:|----------|\n');
    } else {
        stream.write('|\# |Table Name| Description|\n|--:|----------|------------|\n');
    }
}

function details({ stream, tables, types, enums }) {
    stream.write('## Details \n');
    for (let table in tables) {
        stream.write(`### ${table}\n`);
        if (config.noDescriptions) {
            stream.write('|\# |column|type|nullable|default|constraints|\n');
            stream.write('|--:|------|----|--------|-------|-----------|\n');
        } else {
            stream.write(`${tables[table].description}\n\n`);
            stream.write('|\# |column|type|nullable|default|constraints|description|\n');
            stream.write('|--:|------|----|--------|-------|-----------|-----------|\n');
        }
        columnDetails({ stream, columns: tables[table].columns, types, enums});
    }

    stream.write('## Types \n');
    for (let type in types) {
        stream.write(`### ${type}\n`);
        stream.write('|\# |property|type|nullable|\n');
        stream.write('|--:|--------|----|--------|\n');
        propertyDetails({ stream, properties: types[type], types, enums });
    }
    stream.write('## Enums \n');
    for (let enumt in enums) {
        stream.write(`### ${enumt}\n`);
        stream.write('|\# |value|\n');
        stream.write('|--:|-----|\n');
        enumDetails({ stream, values: enums[enumt] });
    }
}

function propertyDetails({ stream, properties, types, enums }) {
    let i = 1;
    for (let name in properties) {
        const data = properties[name];
        const type =
            (types[data.type] || enums[data.type] ?
                `[${data.type}](#${data.type})` : data.type) +
            (data.array ? '[]' : '');
        stream.write(`| ${i} | ${name} | ${type} | ${data.nullable} |\n`);
        i++;
    }
}

function enumDetails({ stream, values }) {
    let i = 1;
    for (let value of values) {
        stream.write(`| ${i} | ${value} |\n`);
        i++;
    }
}

function columnDetails({ stream, columns, types, enums }) {
    let i = 1;
    for (let name in columns) {
        const data = columns[name];
        const type =
            (types[data.type] || enums[data.type] ?
                `[${data.type}](#${data.type})` : data.type) +
            (data.array ? '[]' : '');
        stream.write(`| ${i} | ${name} |  ${type} | ${data.nullable} | ${mdEsc(data.default)} | ${constraintDetails(data.constraints)} |`);
        if (!config.noDescriptions) {
            stream.write(` ${mdEsc(data.description)} |`);
        }
        stream.write('\n');
        i++;
    }
}

function constraintDetails(constraints) {
    if (!constraints) {
        return '';
    }
    let constraintData = [];
    if (constraints) {
        if (constraints.pk) {
            constraintData.push('**PK**');
        }
        if (constraints.unq) {
            constraintData.push('**UNIQ**');
        }
        if (constraints.fk) {
            constraintData.push(`**FK** \([${constraints.fk.table}.${constraints.fk.column}](#${constraints.fk.table})\)`);
        }
    }
    return constraintData.join(', ');
}

function mdEsc(str) {
    if (!str) {
        return '';
    }
    return str.replace(/\|/g, '\\$&');
}

function footer({ stream }) {
    stream.write('---\n');
    stream.write(`generated by [pg-doc](https://github.com/echetzakis/pg-doc) v${version}\n`);
    stream.end();
}

module.exports = render;
