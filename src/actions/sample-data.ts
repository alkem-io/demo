import { CherrytwistClient } from 'cherrytwist-lib';
import {
  XLSXAdapter,
  Populator,
  createLogger,
  createProfiler,
} from 'cherrytwist-populator';
import { assert } from 'console';
import path from 'path';

export const sampleData = async (fileName: string, server: string) => {
  assert(server, 'Server url not provided!');

  const logger = createLogger();
  const profiler = createProfiler();

  const ctClient = new CherrytwistClient({
    graphqlEndpoint: server,
  });

  logger.info(`Cherrytwist server: ${server}`);

  const data = new XLSXAdapter(fileName);

  // Loading data from google sheets
  const populator = new Populator(ctClient, data, logger, profiler);
  await populator.populate();
};
