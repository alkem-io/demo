import { CherrytwistClient } from 'cherrytwist-lib';
import { EcoversePopulator } from './EcoversePopulator';

const main = async () => {
  require("dotenv").config();

  ////////// First connect to the ecoverse //////////////////
  const endPoint = process.env.CT_SERVER;
  if (!endPoint) throw new Error("CT_SERVER enironment variable not set");

  const populator = new EcoversePopulator(endPoint);
  // Get an authorisation token
  populator.logger.info(`Cherrytwist server: ${endPoint}`);

  // Update the context and set the host
  await populator.updateEcoverseContext();
  await populator.updateHostOrganisation();
  await createGroups(populator);

  const userVariablesDir = "./src/data/users";
  await populator.createUsers(userVariablesDir);

  const challengesVariablesDir = "./src/data/challenges";
  await populator.createChallenges(challengesVariablesDir);
}

// Load in mutations file
async function createGroups(populator: EcoversePopulator) {
  const groups = [
    "Leads",
    "Team Members",
    "Specialists",
    "Crew",
    "Challenge Leads",
  ];
  populator.logger.info(
    `===================================================================`
  );

  populator.logger.info(`To create ${groups.length} ecoverse groups`);
  // Iterate over the rows
  for (let i = 0; i < groups.length; i++) {
    const groupName = groups[i];
    await populator.createEcoverseGroup(groupName);
  }
}

try {
  main();
} catch (error) {
  console.error(error);
}
