
function render(context) {
    start(context);
    summary(context);
    // tables(context);
    end(context);
}

function start({ stream }) {
    stream.write(`digraph {
    graph [pad="0.5", nodesep="0.5", ranksep="2"];
    node [shape=rect]
    rankdir=LR;\n\n`);
}

function summary({ stream, tables }) {
    for (let table in tables) {
        stream.write(`${table}\n`);
        const columns = tables[table].columns;
        for (let col in columns) {
            const data = columns[col];
            const constraints = data.constraints;
            if (constraints && constraints.fk) {
                const fk = constraints.fk;
                stream.write(`${table} -> ${fk.table}\n`);
            }
        }
    }
}

function tables({ stream, tables }) {
    for (let table in tables) {
        stream.write(`\n${table} [label=<
<table border="0" cellborder="1" cellspacing="0">
  <tr><td colspan="3" bgcolor="grey"><i><b>${table}</b></i></td></tr>\n`);
        columns({ stream, table, columns: tables[table].columns });
    }
}

function columns({ stream, table, columns }) {
    const rel = [];
    for (let col in columns) {
        const data = columns[col];
        stream.write(`  <tr><td port="${col}_l">${constraintDetails(data.constraints)}</td><td align="left">${col}</td><td align="left" port="${col}_r">${data.type}</td></tr>\n`);
        const constraints = data.constraints;
        if (constraints && constraints.fk) {
            const fk = constraints.fk;
            rel.push(`${table}:${col}_r -> ${fk.table}:${fk.column}_l`);
        }
    }
    stream.write(`</table>>];\n`);
    relations({ stream, relations: rel });
}

function relations({ stream, relations }) {
    if (Array.isArray(relations) && relations.length > 0) {
        stream.write('\n');
        stream.write(relations.join('\n'));
        stream.write('\n');
    }
}

function constraintDetails(constraints) {
    if (!constraints) {
        return '';
    }
    let constraintData = [];
    if (constraints) {
        if (constraints.pk) {
            constraintData.push('<b>PK</b>');
        }
        if (constraints.unq) {
            constraintData.push('<i>UNIQ</i>');
        }
        if (constraints.fk) {
            constraintData.push(`<i>FK</i>`);
        }
    }
    return constraintData.join(', ');
}

function end({ stream }) {
    stream.write('\n}\n');
    stream.end();
}

module.exports = render;
