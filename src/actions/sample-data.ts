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

  const server = process.env.ALKEMIO_SERVER || 'http://localhost:3000/graphql';
  const dataTemplate =
    process.env.ALKEMIO_DATA_TEMPLATE || '../alkemio-sample-sdgs.ods';
  const authInfo = await getAuthInfo();
  const ctClient = new AlkemioClient({
    graphqlEndpoint: server,
    authInfo: authInfo
  });

  logger.info(`Alkemio server: ${server}`);
  logger.info(`Alkemio data template: ${dataTemplate}`);

  await ctClient.validateConnection();
  const ecoverseID = 'Eco1';
  const ecoverseHostID = 'Eco1Host';
  const ecoverseExists = await ctClient.ecoverseExists(ecoverseID);
  console.log(`Ecoverse '${ecoverseID}' exists: ${ecoverseExists}`);
  if (!ecoverseExists) {
    console.log(`Creating '${ecoverseID}' ecoverse and '${ecoverseHostID}' host organisaiton.`);
  // create host org
    await ctClient.createOrganisation(ecoverseHostID, ecoverseHostID);
    await ctClient.createEcoverse({
      nameID: ecoverseID,
      displayName: ecoverseID,
      hostID: ecoverseHostID
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
      password: process.env.AUTH_ADMIN_PASSWORD ?? '!Rn5Ez5FuuyUNc!',
    },
    apiEndpointFactory: () => {
      return 'http://localhost:4433/';
    },
  };
}

