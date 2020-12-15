#!/usr/bin/env node

import { program } from 'commander';
import { populateAvatars } from './actions/populate-avatars';
import { sampleData } from './actions/sample-data';

const main = async () => {
  const version = process.env.npm_package_version || '';
  const name = process.env.npm_package_name || '';

  program.name(name);
  program.version(version);

  program
    .command('import ')
    .alias('i')
    .option('-f,--file <fileName>', 'file to import')
    .option('-s,--server <url>', 'cherry twist graphql endpoint')
    .description('import data from ODS/XLSX file into cherry twist server')
    .action(opts => {
      sampleData(opts.file, opts.server);
    });

  program
    .command('populate-avatars [destination]')
    .alias('a')
    .option('-s,--server <url>', 'cherry twist graphql endpoint')
    .description('populate avatars into destination server')
    .action(opts=> {
      populateAvatars(opts.server);
    });

  await program.parseAsync(process.argv);

};

main().catch(error => {
  console.error(error.message);
});
