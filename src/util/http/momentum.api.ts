import { HttpClient } from './axios.http.client'

export class MomentumApi extends HttpClient {
  public constructor() {
    super('https://prod-v3.odyssey.ninja/backend/api/v1');
  }

  public getAchiever = (id: string) => this.instance.get<any>(`/achiever/${id}`);
  public getTeam= (id: string) => this.instance.get<any>(`/teams/${id}`);
}