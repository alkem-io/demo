import { CherrytwistClient } from 'cherrytwist-lib';
import { GSheetsConnector } from "./util/GSheetsConnector";
import { OrganisationsSheetPopulator } from "./util/OrganisationsSheetPopulator";
import { EnvironmentFactory } from "./util/EnvironmentFactory";
import { createLogger } from './util/create-logger';

const main = async () => {
  const logger = createLogger();
  const config = EnvironmentFactory.getEnvironmentConfig();

  const client = new CherrytwistClient({
    graphqlEndpoint: config.server,
  });

  // client.loadAdminToken();

  // Get an authorisation token
  logger.info(`Cherrytwist server: ${config.server}`);
  const gsheetConnector = new GSheetsConnector(
    config.google_credentials,
    config.google_token,
    config.gsheet
  );

  const orgSheetPopulator = new OrganisationsSheetPopulator(client);

  ////////// Now connect to google  /////////////////////////
  const sheetsObj = await gsheetConnector.getSheetsObj();
  if (sheetsObj) {
    logger.info(`authentication succussful...`);
  }

  // users as last...
  await orgSheetPopulator.updateOrganisationsFromSheet(
    "Organisations",
    gsheetConnector
  );
};

try {
  main();
} catch (error) {
  console.error(error);
}
