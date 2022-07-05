# SHACL2SQL

> Calculates the full path for every https://www.w3.org/ns/shacl#path in the SHACL shape.

## Usage

This tool can be used on the command line to generate an SQL script to create a table in an SQL database. The following options are mandatory:
| Parameter | Shorthand | Description |
| --------- | --------- | ----------- | 
| `--input` | `-i` | Path or URL to a SHACL shape |
| `--output` | `-o` | Path of the SQL script |
| `--tableName` | `-n` | Name of the table |

It is also possible to retrieve the map containing all the paths programmatically, and should be used to extract the data from the objects and then write them to the database.