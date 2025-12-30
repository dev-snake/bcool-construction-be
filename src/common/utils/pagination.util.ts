export class PaginationUtil {
  static getSkipTake(page: number = 1, limit: number = 10) {
    const take = limit > 100 ? 100 : limit;
    const skip = (page - 1) * take;
    return { skip, take };
  }
}
