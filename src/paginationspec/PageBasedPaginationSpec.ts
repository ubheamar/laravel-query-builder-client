import {PaginationSpec} from "./PaginationSpec";
import {QueryParam} from "../QueryParam";

export class PageBasedPaginationSpec extends PaginationSpec
{
  protected pageNumberParamName: string;

  protected pageSizeParamName: string;

  protected pageLimit: number = 10;

  protected pageNumber: number = 1;

  private queryParams: QueryParam[] = [];

  constructor(
    pageNumberParamName: string,
    pageSizeParamName: string,
    pageLimit: number
  ) {
    super();
    this.pageNumberParamName = pageNumberParamName;
    this.pageSizeParamName = pageSizeParamName;
    this.pageLimit = pageLimit;
  }

  public getPaginationParameters(): QueryParam[]
  {
    this.queryParams = [];

    if (this.pageNumber !== undefined) {
      this.queryParams.push(new QueryParam(`${this.pageNumberParamName}`, this.pageNumber));
      this.queryParams.push(new QueryParam(`${this.pageSizeParamName}`, this.pageLimit));
    }

    return this.queryParams;
  }

  public setPage(page: number)
  {
    page = Math.max(page, 1);
    this.pageNumber = page;
  }

  public setPageLimit(pageLimit: number)
  {
    this.pageLimit = pageLimit;
  }

  public getPage():number{
    return this.pageNumber;
  }

  public getPageLimit():number{
    return this.pageLimit;
  }
}
