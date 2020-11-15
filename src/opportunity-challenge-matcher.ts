import { EcoversePopulator } from "./util/EcoversePopulator";
import { EnvironmentFactory } from "./util/EnvironmentFactory";
import { MomentumApi } from "./util/http/momentum.api";

const main = async () => {
  const config = EnvironmentFactory.getEnvironmentConfig();
  const populator = new EcoversePopulator(config);
  populator.loadAdminToken();

  // Assume teams + challenges are available so load them in
  await populator.initialiseEcoverseData();
  
  // Get an authorisation token
  populator.logger.info(`Cherrytwist server: ${config.server}`);

  ////////// First connect to the ecoverse //////////////////
  const momentumApi = new MomentumApi();
  const teamsMap = await getTeams(momentumApi);

  for (let i = 5; i < 10; i++) {
    const opportunityJson = await momentumApi.getAchiever(i.toString())
    const teamJson = teamsMap.get(opportunityJson.team);
    const challengeName = opportunityJson.challenge_name;
    console.log(`Found team ${teamJson.name} for opportunity ${challengeName}`);
    // Map the challenge name to a challenge ID
    const challengeID = populator.lookupChallengeID(challengeName);
    if (!challengeID) {
      console.log(`Unable to locate challenge with name: ${challengeName}`);
      continue;
    }
    const mapping = await populator.createOpportunity2(parseInt(challengeID.challengeID), opportunityJson, teamJson);

    if (i > 3) break;
    
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


