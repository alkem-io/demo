import { CherrytwistClient } from 'cherrytwist-lib';
import { AvatarPopulator } from '../populators/avatar-populator';
import environment from '../environments.json';

export const populateAvatars = async (server?: string) => {
  // const logger = createLogger();
  // ////////// First connect to the ecoverse //////////////////
  const config = environment['local'];
  const graphqlEndpoint = server ?? config.server;
  const client = new CherrytwistClient({
    graphqlEndpoint,
  });

  const populator = new AvatarPopulator(client);
  populator.populate();
};
