import { CherrytwistClient } from 'cherrytwist-lib';
import { EnvironmentFactory } from "./util/EnvironmentFactory";
import { MomentumApi } from "./util/http/momentum.api";
import { gql } from "graphql-request";
import { createLogger } from './util/create-logger';

const main = async () => {
  const logger = createLogger();
  const config = EnvironmentFactory.getEnvironmentConfig();
  const client = new CherrytwistClient({
    graphqlEndpoint: config.server,
  });
  // client.loadAdminToken();

  // Assume teams + challenges are available so load them in
  await client.initialiseEcoverseData();

  // Get an authorisation token
  logger.info(`Cherrytwist server: ${config.server}`);

  // Get the momentum teams
  const momentumApi = new MomentumApi();
  //const teamsMap = await getTeams(momentumApi);

  // get all the opportunities and store them locally
  const opportunitiesMap = await getOpportunitiesCT(client);

  for (let i = 1; i < 98; i++) {
    try {
      const opportunityJson = await momentumApi.getAchiever(i.toString());
      //const teamJson = teamsMap.get(opportunityJson.team);
      const opportunityName = opportunityJson.team;
      logger.info(
        `(${i}) - Processing opportunity with name ${opportunityName}`
      );
      // Map the challenge name to a challenge ID
      const opportunityCTJson = opportunitiesMap.get(opportunityName);
      if (!opportunityCTJson) {
        logger.error(
          `Unable to locate opportunity with name: ${opportunityName}`
        );
        continue;
      }
      // Get the right actor group
      const actorGroups = opportunityCTJson.actorGroups;
      if (actorGroups.length == 0) {
        logger.warn(`No actor groups: ${opportunityName}`);
        continue;
      }

      // Once off fix...rely on the order, not the name
      const stakeholders = opportunityCTJson.actorGroups[1].actors;
      for (let j = 0; j < stakeholders.length; j++) {
        const stakeholder = stakeholders[j];
        const actorID = stakeholder.id;
        const actorName = stakeholder.name;
        let actorLaravel = undefined;
        // Find the right data to update with
        if (
          opportunityJson.stakeholder_1 &&
          opportunityJson.stakeholder_1.name === actorName
        ) {
          actorLaravel = opportunityJson.stakeholder_1;
        } else if (
          opportunityJson.stakeholder_2 &&
          opportunityJson.stakeholder_2.name === actorName
        ) {
          actorLaravel = opportunityJson.stakeholder_2;
        } else if (
          opportunityJson.stakeholder_3 &&
          opportunityJson.stakeholder_3.name === actorName
        ) {
          actorLaravel = opportunityJson.stakeholder_3;
        } else {
          logger.error(`Unable to find matching actor: ${actorName}`);
        }
        await client.updateActor(actorID, actorName, actorLaravel.wins_how, actorLaravel.required_effort, ' ');
      }

      const keyUsers = opportunityCTJson.actorGroups[2].actors;
      for (let j = 0; j < keyUsers.length; j++) {
        const keyUser = keyUsers[j];
        const actorID = keyUser.id;
        const actorName = keyUser.name;
        let actorLaravel = undefined;
        // Find the right data to update with
        if (
          opportunityJson.key_user_1 &&
          opportunityJson.key_user_1.name === actorName
        ) {
          actorLaravel = opportunityJson.key_user_1;
        } else if (
          opportunityJson.key_user_2 &&
          opportunityJson.key_user_2.name === actorName
        ) {
          actorLaravel = opportunityJson.key_user_2;
        } else if (
          opportunityJson.key_user_3 &&
          opportunityJson.key_user_3.name === actorName
        ) {
          actorLaravel = opportunityJson.key_user_3;
        } else {
          logger.error(`Unable to find matching actor: ${actorName}`);
        }
        await client.updateActor(actorID, actorName, actorLaravel.wins_how, ' ', ' ');
      }
    } catch (e) {
      logger.error(
        `Unable to update opportunity: ${e.message}`
      );
    }
  }
};

try {
  main();
} catch (error) {
  console.error(error);
}

async function getOpportunitiesLaravel(
  momentumApi: MomentumApi
): Promise<any[]> {
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

async function getOpportunitiesCT(
  client: EcoversePopulator
): Promise<Map<string, any>> {
  const opportunitiesMap: Map<string, any> = new Map();

  // get the opportunities
  let opportunitiesJson = [];
  try {
    const opportunitiesQuery = gql`
      query {
        opportunities {
          name
          id
          actorGroups {
            id
            name
            actors {
              name
              id
            }
          }
        }
      }
    `;

    const response = await client.client.request(opportunitiesQuery);
    if (response) opportunitiesJson = response.opportunities;
  } catch (e) {
    logger.error(`Unable to load opportunities data: ${e}`);
  }

  if (!opportunitiesJson) throw new Error("Unable to load opportunities data");

  // Put all the opportunities into a map key'd by name
  for (let i = 1; i < opportunitiesJson.length; i++) {
    const opportunityJson = opportunitiesJson[i];
    opportunitiesMap.set(opportunityJson.name, opportunityJson);
  }
  return opportunitiesMap;
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
