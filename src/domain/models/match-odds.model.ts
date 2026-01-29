export class MatchOdds {
  constructor(
    public readonly homeTeam: string,
    public readonly awayTeam: string,
    public readonly commenceTime: string,
    public readonly bookmaker: string,
    public readonly homeOdd: number,
    public readonly drawOdd: number,
    public readonly awayOdd: number,
    public readonly league: string,
    public readonly advice: string,
  ) {}
}
