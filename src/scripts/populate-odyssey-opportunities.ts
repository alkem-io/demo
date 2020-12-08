import { CherrytwistClient } from 'cherrytwist-lib';
import { createLogger } from './util/create-logger';
import { EnvironmentFactory } from "./util/EnvironmentFactory";
import { MomentumApi } from "./util/http/momentum.api";

const main = async () => {
  const logger = createLogger();

  const config = EnvironmentFactory.getEnvironmentConfig();
  const client = new CherrytwistClient({
    graphqlEndpoint: config.server,
  });
  // client.loadAdminToken();

  // Get an authorisation token
  logger.info(`Cherrytwist server: ${config.server}`);

  // Get the momentum teams
  const momentumApi = new MomentumApi();
  const teamsMap = await getTeams(momentumApi);

  for (let i = 1; i < 98; i++) {
    const opportunityJson = await momentumApi.getAchiever(i.toString())
    const teamJson = teamsMap.get(opportunityJson.team);
    const challengeName = opportunityJson.challenge_name;
    logger.info(`(${i}) - Found team ${teamJson.name} for opportunity ${challengeName}`);
    // Map the challenge name to a challenge ID
    const challengeID = client.lookupChallengeID(challengeName);
    if (!challengeID) {
      logger.error(`Unable to locate challenge with name: ${challengeName}`);
      continue;
    }
    try {
      await client.createOpportunity2(parseInt(challengeID.challengeID), opportunityJson, teamJson);
    } catch (e) {
      logger.error(`Unable to create opportunity: ${opportunityJson.team} - ${e.message}`);
    }

  }
};

try {
  main();
} catch (error) {
  console.error(error);
}

async function getOpportunities(momentumApi: MomentumApi): Promise<any[]> {
  let opportunities = [];
  let i = 1;
  let opportunity;

  do {
    try {
      opportunity = await momentumApi.getAchiever(i.toString());
    } catch (error) {
      break;
    }

    if (opportunity) {
      opportunities.push(opportunity);
      console.log(`Opportunity with ID ${i} read.`);
      i++;
    }

    if (i > 3) break;
  } while (opportunity);

  return opportunities;
}

async function getTeams(momentumApi: MomentumApi): Promise<Map<string, any>> {
  const teamsMap: Map<string, any> = new Map();
  let i = 1;
  let team;

  do {
    try {
      team = await momentumApi.getTeam(i.toString());
    } catch (error) {
      break;
    }

    if (team) {
      teamsMap.set(team.name, team);
      console.log(`Team with ID ${i} read.`);
      i++;
    }
  } while (team);

  return teamsMap;
}


