import { AuthInfo, CherrytwistClient } from '@cherrytwist/client-lib';
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
  const authInfo = await getAuthInfo();
  const ctClient = new CherrytwistClient({
    graphqlEndpoint: server,
    authInfo: authInfo
  });

  logger.info(`Cherrytwist server: ${server}`);
  logger.info(`Cherrytwist data template: ${dataTemplate}`);

  await ctClient.validateConnection();
  const ecoverseID = 'cherrytwist';
  const ecoverseHostID = 'cherrytwistOrg';
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
      email: process.env.AUTH_ADMIN_EMAIL ?? 'admin@cherrytwist.org',
      password: process.env.AUTH_ADMIN_PASSWORD ?? '!Rn5Ez5FuuyUNc!',
    },
    apiEndpointFactory: () => {
      return 'http://localhost:4433/';
    },
  };
}

