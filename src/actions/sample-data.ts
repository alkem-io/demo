import { CherrytwistClient } from 'cherrytwist-lib';
import environment from '../environments.json';
import {
  XLSXAdapter,
  Populator,
  createLogger,
  createProfiler,
} from 'cherrytwist-populator';
import path from 'path';

export const sampleData = async (fileName?: string, server?: string) => {
  const logger = createLogger();
  const profiler = createProfiler();

  const config = environment['local'];
  const graphqlEndpoint = server ?? config.server;

  const ctClient = new CherrytwistClient({
    graphqlEndpoint,
  });

  logger.info(`Cherrytwist server: ${graphqlEndpoint}`);

  const file = fileName ?? path.join(__dirname,'..', 'data', 'sample.ods');
  const data = new XLSXAdapter(file);
  // Loading data from google sheets
  const populator = new Populator(ctClient, data, logger, profiler);
  console.log('Populate', file);
 // await populator.populate();
};
