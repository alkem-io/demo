import { AuthInfo, AlkemioClient } from '@alkemio/client-lib';
import {
  XLSXAdapter,
  Populator,
  createLogger,
  createProfiler,
} from '@alkemio/populator';
import * as dotenv from 'dotenv';
import path from 'path';
import { Logger } from 'winston';
import winston from 'winston/lib/winston/config';

export const sampleData = async () => {
  dotenv.config();
  const logger = createLogger();
  const profiler = createProfiler();

  const alkemioClient = await createClientUsingEnvVars(logger)

  const dataTemplate =
    process.env.ALKEMIO_DATA_TEMPLATE || '../alkemio-sample-sdgs.ods';
    logger.info(`Alkemio data template: ${dataTemplate}`);



  await alkemioClient.validateConnection();
  const hubID = 'un-sdgs';
  const hubHostID = 'united-nations';
  const hubExists = await alkemioClient.hubExists(hubID);
  console.log(`Hub '${hubID}' exists: ${hubExists}`);
  if (!hubExists) {
    console.log(`Creating '${hubID}' Hub and '${hubHostID}' host organisaiton.`);
    // create host org
    await alkemioClient.createOrganization(hubHostID, hubHostID);
    await alkemioClient.createHub({
      nameID: hubID,
      displayName: hubID,
      hostID: hubHostID
    })
  }

  const data = new XLSXAdapter(path.join(__dirname, '..', dataTemplate));
  // Loading data from google sheets
  const populator = new Populator(alkemioClient, data, logger, profiler);
  await populator.populate();
};



async function createClientUsingEnvVars(logger: Logger) {
  dotenv.config();

  const server = process.env.API_ENDPOINT_PRIVATE_GRAPHQL || 'http://localhost:3000/api/private/non-interactive/graphql';
  const alkemioClient = new AlkemioClient({
    apiEndpointPrivateGraphql: server,
  });

  alkemioClient.config.authInfo = {
    credentials: {
      email: process.env.AUTH_ADMIN_EMAIL ?? 'admin@alkem.io',
      password: process.env.AUTH_ADMIN_PASSWORD ?? '@lk3m10!',
    },
  };

  logger.info(`Alkemio server: ${(await alkemioClient).config.apiEndpointPrivateGraphql}`);
  try {
    await alkemioClient.enableAuthentication();
    logger.info('Authentication: successful');
  } catch (e) {
    logger.info(`Unable to authenticate to Alkemio: ${e}`);
    throw e;
  }

  return alkemioClient;
};

