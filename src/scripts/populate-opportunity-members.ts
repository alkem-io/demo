import { gql } from 'graphql-request';
import { EnvironmentFactory } from './util/EnvironmentFactory';
import { CherrytwistClient } from 'cherrytwist-lib';
import { createLogger } from './util/create-logger';

const main = async () => {
  const logger = createLogger();

  ////////// First connect to the ecoverse //////////////////
  const config = EnvironmentFactory.getEnvironmentConfig();
  const client = new CherrytwistClient({
    graphqlEndpoint: config.server,
  });
  // client.loadAdminToken();

  // Get an authorisation token
  logger.info(`Cherrytwist server: ${config.server}`);

  const groupsQuery = gql`
    {
      groupsWithTag(tag: "Team") {
        id
        name
        members {
          id
          name
        }
      }
    }
  `;

  const opportunitiesQuery = gql`
    {
      opportunities {
        id
        name
        groups {
          id
          name
        }
      }
    }
  `;

  const { groupsWithTag } = await client.client.request(groupsQuery);
  const { opportunities } = await client.client.request(opportunitiesQuery);

  for (let t = 0; t < groupsWithTag.length; t++) {
    const group = groupsWithTag[t];
    const name = group.name;
    const members = group.members;
    logger.info(
      `[${t}] - Processing group: ${name} with ${members.length} members`
    );
    const foundOpp = opportunities.find((o: any) => o.name === name);

    if (foundOpp) {
      // add each member of matched "Team" group, to the opportunity
      logger.info(`[${t}] - ... found corresponding opportunity`);
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        logger.info(`[${t}] - ......adding user: ${member.name}`);
        try {
          await client.addUserToOpportunity(foundOpp.id, member.id);
        } catch (e) {
          logger.error(`[${t}] - ${e}`);
        }
      }
    } else {
      logger.error(`No opportunity with name ${name} found`);
    }
  }
};

try {
  main();
} catch (error) {
  console.error(error);
}
