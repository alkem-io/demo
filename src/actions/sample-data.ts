import { CherrytwistClient } from '@cherrytwist/client-lib';
import {
  XLSXAdapter,
  Populator,
  createLogger,
  createProfiler,
} from '@cherrytwist/populator';
import * as dotenv from 'dotenv';
import path from 'path';

export const sampleData = async () => {
  dotenv.config();
  const logger = createLogger();
  const profiler = createProfiler();

  const server = process.env.CT_SERVER || 'http://localhost:4000/graphql';
  const dataTemplate =
    process.env.CT_DATA_TEMPLATE || '../cherrytwist-data-template.ods';
  const accessToken = process.env.CT_ACCESS_TOKEN || 'eyNotSet';
  const ctClient = new CherrytwistClient({
    graphqlEndpoint: server,
    accessToken: `${accessToken}`,
  });

  logger.info(`Cherrytwist server: ${server}`);
  logger.info(`Cherrytwist data template: ${dataTemplate}`);

  await ctClient.validateConnection();

  const data = new XLSXAdapter(path.join(__dirname, '..', dataTemplate));
  // Loading data from google sheets
  const populator = new Populator(ctClient, data, logger, profiler);
  await populator.populate();
};

