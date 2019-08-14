[![npm version](https://badge.fury.io/js/pg-doc.svg)](https://badge.fury.io/js/pg-doc)

# pg-doc

Produce **markdown** schema documentation for your **Postgres** database.

# Installation
```
npm i pg-doc
```
or globally:

```
npm i -g pg-doc
```

# Usage

```
Usage: pg-doc [options]

Options:
  --version                Show version number                         [boolean]
  --connection, --db       Database Connection URL           [string] [required]
  --out, -o                The file name of the output                  [string]
  --title, -t              The title of the document                    [string]
  --excluded, --ex         Tables to be excluded                         [array]
  --toc                    Add a table of contents (TOC) section
                                                       [boolean] [default: true]
  --split-by-initial, -s   Split TOC by initial letter                 [boolean]
  --split-limit, --sl      Split TOC only if number of tables is greater that
                           this limit                     [number] [default: 20]
  --no-descriptions, --nd  Don't output table/column descriptions      [boolean]
  --help                   Show help                                   [boolean]
```

# Configuration
  
There are 2 alternative ways to pass configuration options appart from the command line.

## Options file
You can put your options in a `.pg-doc.json` file in your project:

```
{
    "connection": <postgres connection url>,
    "excluded": <string array>,
    "noDescriptions": <boolean>,
    "toc": <boolean>,
    "splitByInitial": <boolean>,
    "splitLimit": <number>,
    "title": <string>,
    "out": <filename>
}
```

## Environment variables
Use the following variables to pass options to `pg-doc`:
```
PGDOC_CONNECTION=<postgres connection url> 
PGDOC_OUT=<filename>
PGDOC_TITLE=<string>
PGDOC_EXCLUDED=<comma separated strings>
PGDOC_SPLIT_LIMIT=<number>
PGDOC_SPLIT_BY_INITIAL=<boolean>
PGDOC_NO_DESCRIPTIONSL=<boolean>
PGDOC_TOC=<boolean>
```
## Precedence
Configuration options are applied in the following order (from lowest to highest precedence):

`.pg-doc.json --> env variables --> command line options`

# Table and Column descriptions
By default `pg-doc` will show the description you have defined as table/column comments in your database, ie:
```
sql> COMMENT ON TABLE foo IS 'This is my foo table.';
```
If you have no comments defined you can either disable this by setting the `noDescriptions` option to `true` or provide your descriptions by adding a `descriptions` section in your `.pg-doc.json` file like so:
```
{
    "descriptions": {
        "tableName": "this is my tableName description",
        "tableName.columnName": "this is my columnName description"
    }
}
```
