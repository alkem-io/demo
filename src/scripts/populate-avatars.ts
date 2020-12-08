import { gql } from 'graphql-request';
import { EnvironmentFactory } from '../util/EnvironmentFactory';
import { CherrytwistClient } from 'cherrytwist-lib';
import { createLogger } from '../util/create-logger';

const main = async () => {
  const logger = createLogger();
  ////////// First connect to the ecoverse //////////////////
  const config = EnvironmentFactory.getEnvironmentConfig();
  const client = new CherrytwistClient({
    graphqlEndpoint: config.server,
  });

  // Get an authorisation token
  logger.info(`Cherrytwist server: ${config.server}`);

  // First get all the users

  const users = await client.users();

  if (!users) {
    logger.error('Unable to load users');
    throw new Error('Unable to load users');
  }

  let matches = 0;
  for (let i = 0; i < users.length; i++) {
    const userInfo = users[i];
    const avatar = userInfo?.profile?.avatar;
    if (avatar && avatar.length > 0) continue; // already has an avatar
    const avatarUri = `https://eu.ui-avatars.com/api/?name=${userInfo.firstName}+${userInfo.lastName}&background=0D8ABC&color=fff`;
    try {
      await client.updateUserProfile(userInfo.email, '', avatarUri);
      logger.info(`...........updated avatar to be "${avatarUri}"`);

      matches++;
    } catch (e) {
      logger.error(`Unable to set user profile for user (${i}): ${e}`);
    }
  }
  logger.info(`Located ${matches} matches`);
};

try {
  main();
} catch (error) {
  console.error(error);
}
