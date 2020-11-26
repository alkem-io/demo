import {gql} from "graphql-request";
import {EnvironmentFactory} from "./util/EnvironmentFactory";
import {EcoversePopulator} from "./util/EcoversePopulator";


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
    const { opportunities } = await populator.client.request(opportunitiesQuery)

    groupsWithTag.forEach(({ name,  members }: {name: string, members: Array<{id: string, name: string}>}) => {
        // find opportunity with name matching to the "Team" group one
        const foundOpp = opportunities.find((o: any) => o.name === name)

        if(foundOpp) {
            // add each member of matched "Team" group, to the opportunity
            members.forEach(async (member) => {
                await populator.addUserToOpportunity(member.id, foundOpp.id)
            })
    } else console.error(`No opportunity with name ${name} found`)
    })

};

try {
    main();
} catch (error) {
    console.error(error);
}
