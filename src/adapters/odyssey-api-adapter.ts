import {
  AbstractDataAdapter,
  Ecoverse,
  Challenge,
  User,
  Opportunity,
  Organisation,
  Group,
} from 'cherrytwist-populator';
import { MomentumApi } from '../util/http/momentum.api';

export class OdysseyAPIAdapter extends AbstractDataAdapter {
  private momentumApi: MomentumApi;

  constructor() {
    super();
    this.momentumApi = new MomentumApi();
    const teamsMap = await getTeams(this.momentumApi);

  for (let i = 1; i < 98; i++) {
    const opportunityJson = await this.momentumApi.getAchiever(i.toString());
    const teamJson = teamsMap.get(opportunityJson.team);
    const challengeName = opportunityJson.challenge_name;
    // logger.info(
    //   `(${i}) - Found team ${teamJson.name} for opportunity ${challengeName}`
    // );
    // Map the challenge name to a challenge ID
    //const challengeID = client.lookupChallengeID(challengeName);
    // if (!challengeID) {
    //   logger.error(`Unable to locate challenge with name: ${challengeName}`);
    //   continue;
    // }
    try {
      // await client.createOpportunity2(
      //   parseInt(challengeID.challengeID),
      //   opportunityJson,
      //   teamJson
      // );
    } catch (e) {
      // logger.error(
      //   `Unable to create opportunity: ${opportunityJson.team} - ${e.message}`
      // );
    }
  }
  }

  ecoverses(): Ecoverse[] {
    throw new Error('Method not implemented.');
  }
  challenges(): Challenge[] {
    throw new Error('Method not implemented.');
  }
  users(): User[] {
    throw new Error('Method not implemented.');
  }
  opportunities(): Opportunity[] {
    throw new Error('Method not implemented.');
  }
  organisations(): Organisation[] {
    throw new Error('Method not implemented.');
  }
  groups(): Group[] {
    throw new Error('Method not implemented.');
  }
  hosts(): Organisation[] {
    throw new Error('Method not implemented.');
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


}
