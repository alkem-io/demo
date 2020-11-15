import { EcoversePopulator } from "./util/EcoversePopulator";
import { GSheetsConnector } from "./util/GSheetsConnector";
import { OrganisationsSheetPopulator } from "./util/OrganisationsSheetPopulator";
import { EnvironmentFactory } from "./util/EnvironmentFactory";

const main = async () => {
  const config = EnvironmentFactory.getEnvironmentConfig();
  const populator = new EcoversePopulator(config);
  populator.loadAdminToken();
  
  // Get an authorisation token
  populator.logger.info(`Cherrytwist server: ${config.server}`);
  const gsheetConnector = new GSheetsConnector(
    config.google_credentials,
    config.google_token,
    config.gsheet
  );

  const orgSheetPopulator = new OrganisationsSheetPopulator(populator);

  ////////// Now connect to google  /////////////////////////
  const sheetsObj = await gsheetConnector.getSheetsObj();
  if (sheetsObj) {
    populator.logger.info(`authentication succussful...`);
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
