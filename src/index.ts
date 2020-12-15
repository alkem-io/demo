#!/usr/bin/env node

import { program } from 'commander';
import { populateAvatars } from './actions/populate-avatars';
import { sampleData } from './actions/sample-data';

const main = async () => {
  const version = process.env.npm_package_version || '';
  const name = process.env.npm_package_name || '';

  program.name(name);
  program.version(version);

  program.on('--help', () => {
    console.log();
    console.log(
      `For more information visit: https://github.com/cherrytwist/Demo/blob/develop/README.md`
    );
  });

  program
    .command('populate')
    .alias('p')
    .option(
      '-f, --file <fileName>',
      `ODS/XLSX file to import, if not set sample-data will be populated`
    )
    .option(
      '-s, --server <url>',
      'cherry twist graphql endpoint',
      'http://localhost:4000/graphql'
    )
    .description('import data from ODS/XLSX file to cherry twist server')
    .action(opts => {
      sampleData(opts.file, opts.server);
    })
    .on('--help', () => {
      console.log();
      console.log(
        `For more information visit: https://github.com/cherrytwist/Demo/blob/develop/README.md`
      );
    });

  program
    .command('populate-avatars')
    .alias('a')
    .option(
      '-s, --server <url>',
      'cherry twist graphql endpoint',
      'http://localhost:4000/graphql'
    )
    .description('populate avatars into destination server')
    .action(opts => {
      populateAvatars(opts.server);
    })
    .on('--help', () => {
      console.log();
      console.log(
        `For more information visit: https://github.com/cherrytwist/Demo/blob/develop/README.md`
      );
    });

  await program.parseAsync(process.argv);
};

main().catch(error => {
  console.error(error.message);
});
