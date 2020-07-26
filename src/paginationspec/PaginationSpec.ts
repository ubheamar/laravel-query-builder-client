import {QueryParam} from "../QueryParam";

export abstract class PaginationSpec
{
  public abstract getPaginationParameters(): QueryParam[];

  /**
   * @param value
   */
  public abstract setPage(value: number) : void;

  public abstract setPageLimit(pageLimit: number):void;
}
