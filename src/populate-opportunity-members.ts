import { gql } from "graphql-request";
import { EnvironmentFactory } from "./util/EnvironmentFactory";
import { EcoversePopulator } from "./util/EcoversePopulator";

const main = async () => {
  require("dotenv").config();

  ////////// First connect to the ecoverse //////////////////
  const config = EnvironmentFactory.getEnvironmentConfig();
  const populator = new EcoversePopulator(config);
  populator.loadAdminToken();

  // Get an authorisation token
  populator.logger.info(`Cherrytwist server: ${config.server}`);

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

  const { groupsWithTag } = await populator.client.request(groupsQuery);
  const { opportunities } = await populator.client.request(opportunitiesQuery);

  const logger = populator.logger;
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
        populator.logger.info(`[${t}] - ......adding user: ${member.name}`);
        try {
          await populator.addUserToOpportunity(foundOpp.id, member.id);
        } catch (e) {
          populator.logger.error(`[${t}] - ${e}`);
        }
      }
    } else {
      populator.logger.error(`No opportunity with name ${name} found`);
    }
  }
};

try {
  main();
} catch (error) {
  console.error(error);
}
