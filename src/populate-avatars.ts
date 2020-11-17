import { EcoversePopulator } from "./util/EcoversePopulator";
import { gql } from "graphql-request";
import { EnvironmentFactory } from "./util/EnvironmentFactory";

const main = async () => {
  require("dotenv").config();
  const fs = require("fs");

  ////////// First connect to the ecoverse //////////////////
  const config = EnvironmentFactory.getEnvironmentConfig();
  const populator = new EcoversePopulator(config);
  populator.loadAdminToken();

  // Get an authorisation token
  populator.logger.info(`Cherrytwist server: ${config.server}`);

  // First get all the users
  let users = [];
  try {
    const usersQuery = gql`
      query {
        users {
          firstName
          lastName
          id
          profile {
            id
            avatar
            description
          }
        }
      }
    `;

    const usersResponse = await populator.client.request(usersQuery);
    if (usersResponse) users = usersResponse.users;
  } catch (e) {
    populator.logger.error(`Unable to process user: ${e}`);
  }

  if (!users) throw new Error();

  let matches = 0;
  for (let i = 0; i < users.length; i++) {
    const userInfo = users[i];
    const avatar = userInfo.profile.avatar;
    if (avatar && avatar.length >0) continue; // already has an avatar
    const avatarUri = `https://eu.ui-avatars.com/api/?name=${userInfo.firstName}+${userInfo.lastName}&background=0D8ABC&color=fff`;
    try {
      const updateProfileVariable = gql`{
        "ID": ${userInfo.profile.id},
        "profileData": {
        "avatar": "${avatarUri}",
        "description": "${userInfo.profile.avatar}"
        }
      }`;
      const updateProfileResponse = await populator.client.request(
        populator.updateProfileStr,
        updateProfileVariable
      );
      populator.logger.info(`...........updated avatar to be "${avatarUri}"`);

      matches++;
    } catch (e) {
      populator.logger.error(`Unable to process user (${i}): ${e}`);
    }
  }
  populator.logger.info(`Located ${matches} matches`);
};

try {
  main();
} catch (error) {
  console.error(error);
}
