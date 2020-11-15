import { env } from "process";
import { MomentumApi } from './util/http/momentum.api'

const main = async () => {
  // require("dotenv").config();
  // const fs = require("fs");

  ////////// First connect to the ecoverse //////////////////
  const momentumApi = new MomentumApi();
  const opportunities = await getOpportunities(momentumApi);
  const teams = await getTeams(momentumApi);

  // for(let i=0; i < teams.length; i++)
  // {
  //   if(teams[i].id === opportunities[i].team_id)
  //     teams[i].opportunities = opportunities[i];
  //   else
  //     throw new Error(`Team with id {i} could not be mapped!`);
  // }
  await addOpportunitiesToTeams(teams, opportunities);

};

try {
  main();
} catch (error) {
  console.error(error);
}

async function getOpportunities(momentumApi: MomentumApi): Promise<any[]>{

  let opportunities = [];
  let i = 1;
  let opportunity;

  do
  {
    try {
      opportunity = await momentumApi.getAchiever(i.toString());
    } catch (error) {
      break;
    }

    if(opportunity)
    {
      opportunities.push(opportunity);
      console.log(`Team with ID ${i} read.`)
      i++;
    }
  }
  while (opportunity);

  return opportunities;
}

async function getTeams(momentumApi: MomentumApi): Promise<any[]>{

  let teams = [];
  let i = 1;
  let team;

  do
  {
    try {
      team = await momentumApi.getTeam(i.toString());
    } catch (error) {
      break;
    }

    if(team)
    {
      teams.push(team);
      console.log(`Team with ID ${i} read.`)
      i++;
    }
  }
  while (team);

  return teams;
}

async function addOpportunitiesToTeams(teams: any[], opportunities: any[]){
  for(let i=0; i< teams.length; i++)
  {
    if(teams[i].id === opportunities[i].team_id)
      teams[i].opportunities = opportunities[i];
    else
      throw new Error(`Team with id {i} could not be mapped!`);
  }
}
