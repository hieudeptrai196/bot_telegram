export class Standing {
  constructor(
    public readonly position: number,
    public readonly teamName: string,
    public readonly playedGames: number,
    public readonly won: number,
    public readonly draw: number,
    public readonly lost: number,
    public readonly points: number,
    public readonly goalsFor: number,
    public readonly goalsAgainst: number,
    public readonly goalDifference: number,
    public readonly crest: string,
  ) {}
}
