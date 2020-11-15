import { EcoversePopulator } from "./util/EcoversePopulator";
import { GSheetsConnector } from "./util/GSheetsConnector";
import { EnvironmentFactory } from "./util/EnvironmentFactory";
import { ChallengesSheetPopulator } from "./util/ChallengesSheetPopulator";

const main = async () => {
  const config = EnvironmentFactory.getEnvironmentConfig();
  const populator = new EcoversePopulator(config);
  
  // Get an authorisation token
  populator.logger.info(`Cherrytwist server: ${config.server}`);
  const gsheetConnector = new GSheetsConnector(
    config.google_credentials,
    config.google_token,
    config.gsheet
  );

  const challengesSheetPopulator = new ChallengesSheetPopulator(populator);

  ////////// Now connect to google  /////////////////////////
  const sheetsObj = await gsheetConnector.getSheetsObj();
  if (sheetsObj) {
    populator.logger.info(`authentication succussful...`);
  }

  // users as last...
  await challengesSheetPopulator.updateChallengesContextFromSheet(
    "Challenges",
    gsheetConnector
  );
};

try {
  main();
} catch (error) {
  console.error(error);
}
