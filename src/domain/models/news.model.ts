export class News {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly url: string,
    public readonly source: string,
    public readonly publishedAt: string,
  ) {}
}
