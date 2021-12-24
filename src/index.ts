#!/usr/bin/env node

import { program } from 'commander';
import { populateAvatars } from './actions/populate-avatars';
import { sampleData } from './actions/sample-data';
import { DEFAULT_SERVER_URL } from './constants';

const main = async () => {
  const version = process.env.npm_package_version || '';
  const name = process.env.npm_package_name || '';

  program.name(name);
  program.version(version);

  program.on('--help', () => {
    console.log();
    console.log(
      `For more information visit: https://github.com/alkem-io/Demo/blob/develop/README.md`
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
      'alkemio graphql endpoint',
      DEFAULT_SERVER_URL
    )
    .description('import data from ODS/XLSX file to alkemio server')
    .action(opts => {
      const file = opts.file ?? 'alkemio-data-template.ods';
      const server = opts.server ?? DEFAULT_SERVER_URL;
      sampleData(file, server);
    })
    .on('--help', () => {
      console.log();
      console.log(
        `For more information visit: https://github.com/alkem-io/Demo/blob/develop/README.md`
      );
    });

  program
    .command('populate-avatars')
    .alias('a')
    .option(
      '-s, --server <url>',
      'alkemio graphql endpoint',
      DEFAULT_SERVER_URL
    )
    .description('populate avatars into destination server')
    .action(opts => {
      const server = opts.server ?? DEFAULT_SERVER_URL;
      populateAvatars(server);
    })
    .on('--help', () => {
      console.log();
      console.log(
        `For more information visit: https://github.com/alkem-io/Demo/blob/develop/README.md`
      );
    });

  await program.parseAsync(process.argv);
};

main().catch(error => {
  console.error(error.message);
});
