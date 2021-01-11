import { CherrytwistClient } from 'cherrytwist-lib';
import { AbstractPopulator } from 'cherrytwist-populator';

export class AvatarPopulator extends AbstractPopulator {
  constructor(client: CherrytwistClient) {
    super(client);
  }

  public async populate() {
    const users = await this.client.users();

    if (!users) {
      this.logger.error('Unable to load users');
      throw new Error('Unable to load users');
    }

    let matches = 0;
    for (let i = 0; i < users.length; i++) {
      const userInfo = users[i];
      const avatar = userInfo?.profile?.avatar;
      if (avatar && avatar.length > 0) continue; // already has an avatar
      const avatarUri = `https://eu.ui-avatars.com/api/?name=${userInfo.firstName}+${userInfo.lastName}&background=0D8ABC&color=fff`;
      try {
        await this.client.updateUserProfile(userInfo.email, '', avatarUri);
        this.logger.info(`... updated avatar to be "${avatarUri}"`);

        matches++;
      } catch (e) {
        this.logger.error(`Unable to set user profile for user (${i}): ${e}`);
      }
    }

    this.logger.info(`Located ${matches} matches`);
  }
}