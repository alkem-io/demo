import { AuthInfo, AlkemioClient } from '@alkemio/client-lib';
import {
  XLSXAdapter,
  Populator,
  createLogger,
  createProfiler,
} from '@alkemio/populator';
import * as dotenv from 'dotenv';
import path from 'path';

export const sampleData = async () => {
  dotenv.config();
  const logger = createLogger();
  const profiler = createProfiler();

  const server = process.env.ALKEMIO_SERVER || 'http://localhost:3000/admin/graphql';
  const dataTemplate =
    process.env.ALKEMIO_DATA_TEMPLATE || '../alkemio-sample-sdgs.ods';
  const ctClient = new AlkemioClient({
    graphqlEndpoint: server,
  });
  logger.info(`Alkemio server: ${server}`);
  logger.info(`Alkemio data template: ${dataTemplate}`);
  ctClient.config.authInfo = await getAuthInfo();
  try {
    await ctClient.enableAuthentication();
    logger.info('Authentication: successful');
  } catch (e) {
    logger.info(`Unable to authenticate to Alkemio: ${e}`);
    return;
  }

  await ctClient.validateConnection();
  const hubID = 'Eco1';
  const hubHostID = 'Eco1Host';
  const hubExists = await ctClient.hubExists(hubID);
  console.log(`Hub '${hubID}' exists: ${hubExists}`);
  if (!hubExists) {
    console.log(`Creating '${hubID}' Hub and '${hubHostID}' host organisaiton.`);
  // create host org
    await ctClient.createOrganization(hubHostID, hubHostID);
    await ctClient.createHub({
      nameID: hubID,
      displayName: hubID,
      hostID: hubHostID
    })
  }

  const data = new XLSXAdapter(path.join(__dirname, '..', dataTemplate));
  // Loading data from google sheets
  const populator = new Populator(ctClient, data, logger, profiler);
  await populator.populate();
};

async function getAuthInfo(): Promise<AuthInfo | undefined> {
  return {
    credentials: {
      email: process.env.AUTH_ADMIN_EMAIL ?? 'admin@alkem.io',
      password: process.env.AUTH_ADMIN_PASSWORD ?? '@lk3m10!',
    },
    apiEndpointFactory: () => {
      return 'http://localhost:3000/identity/ory/kratos/public';
    },
  };
}

