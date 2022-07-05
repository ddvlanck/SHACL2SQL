import yargs from 'yargs';
import { ISqlOptions, toSql } from '../lib/shacl2sql';

const run = async (): Promise<void> => {
  const yargv = yargs(process.argv.slice(2))
    .usage('node ./bin/runner.js [args]')
    .option('i', { alias: 'input', describe: 'URL or local path to a file containing the SHACL shape' })
    .option('o', { alias: 'output', describe: 'Path of the output file containing the SQL statements' })
    .option('n', { alias: 'name', describe: 'The name for the SQL table' })
    .demandOption(['i', 'o', 'n'])
    .help('h')
    .alias('h', 'help')

  const params = await yargv.parse();
  const options: ISqlOptions = {
    input: <string>params.i,
    output: <string>params.o,
    tableName: <string>params.n
  }
  await toSql(options);
}

run().catch(error => console.error(error));
