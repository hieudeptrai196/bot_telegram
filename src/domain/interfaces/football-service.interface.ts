import { Standing } from '../models/standing.model';

export interface IFootballService {
  getLaLigaStandings(): Promise<Standing[]>;
}
export const IFootballService = Symbol('IFootballService');
