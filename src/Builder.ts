import {QueryMethods} from "./QueryMethods";
import {SingularResponse} from "./response/SingularResponse";
import {Query} from "./Query";
import {HttpClient} from "./httpclient/HttpClient";
import {Model} from "./Model";
import {SortDirection} from "./SortDirection";
import {PageBasedPaginationSpec} from "./paginationspec/PageBasedPaginationSpec";
import {HttpClientResponse} from "./httpclient/HttpClientResponse";
import {AxiosError} from "axios";
import {PluralResponse} from "./response/PluralResponse";
import {FilterSpec} from "./FilterSpec";
import {SortSpec} from "./SortSpec";
import {Option} from "./Option";
import ApiError from "./util/ApiError";

export class Builder implements QueryMethods {
  protected modelType: any;

  private httpClient: HttpClient;

  private query: Query;
  /**
   * If true, then this function will in all cases return a SingularResponse. This is used by ToOneRelations, which
   * when queried spawn a Builder with this property set to true.
   */
  private forceSingular: boolean;

  constructor(
    modelType: typeof Model,
    queriedRelationName: string | undefined = undefined,
    baseModelJsonApiType: string | undefined = undefined,
    baseModelJsonApiId: string | undefined = undefined,
    forceSingular: boolean = false) {

    this.modelType = modelType;
    let modelInstance: Model = (new (<any>modelType)());
    baseModelJsonApiType = baseModelJsonApiType
      ? baseModelJsonApiType
      : modelInstance.getJsonApiType();
    this.query = new Query(baseModelJsonApiType, queriedRelationName, baseModelJsonApiId);
    this.initPaginationSpec();
    this.httpClient = modelType.getHttpClient();
    this.forceSingular = forceSingular;
  }


  public get(page?: number): any {

    const clone = this.clone();
    if (page)
      clone.getQuery().getPaginationSpec().setPage(page);
    if (this.forceSingular) {
      return <Promise<SingularResponse>>this.getHttpClient()
        .get(clone.getQuery().toString())
        .then(
          (response: HttpClientResponse) => {
            return new SingularResponse(clone.getQuery(), response, this.modelType, response.getData());
          },
          function (response: AxiosError) {

            throw new ApiError(response);
          }
        );
    } else {
      return <Promise<PluralResponse>>this.getHttpClient()
        .get(clone.getQuery().toString())
        .then(
          (response: HttpClientResponse) => {
            return new PluralResponse(clone.getQuery(), response, this.modelType, response.getData());
          },
          function (response: AxiosError) {
            throw new ApiError(response);
          }
        );
    }
  }

  public first(): Promise<SingularResponse> {
    const clone = this.clone();
    clone.getQuery().getPaginationSpec().setPageLimit(1);
    return <Promise<SingularResponse>>this.getHttpClient()
      .get(this.query.toString())
      .then(
        (response: HttpClientResponse) => {
          return new SingularResponse(this.query, response, this.modelType, response.getData());
        },
        function (response: AxiosError) {
          throw new ApiError(response);
        }
      );
  }

  public limit(limit: number) {
    const clone = this.clone();
    clone.getQuery().setLimit(limit);
    return clone;
  }

  public find(id: string | number): Promise<SingularResponse> {
    const clone = this.clone();
    clone.query.setIdToFind(id);
    return <Promise<SingularResponse>>clone.getHttpClient()
      .get(clone.getQuery().toString())
      .then(
        (response: HttpClientResponse) => {
          return new SingularResponse(clone.getQuery(), response, this.modelType, response.getData());
        },
        function (response: AxiosError) {
          throw new ApiError(response);
        }
      );
  }

  public deleteRecords(ids: any): Promise<void> {
    if (!ids)
      throw new Error('Please provide ids correctly.');
    const clone = this.clone();
    return clone.getHttpClient()
      .post(this.getQuery().getJsonApiType() + '/delete', ids)
      .then(function (response: HttpClientResponse) {

      }, function (response: AxiosError) {
        throw new ApiError(response);
      });
  }

  public where(attribute: string, value: string): Builder {
    const clone = this.clone();
    clone.getQuery().addFilter(new FilterSpec(attribute, value));
    return clone;
  }

  public with(value: any): Builder {
    const clone = this.clone();

    if (typeof value === 'string') {
      clone.getQuery().addInclude(value);
    } else if (Array.isArray(value)) {
      for (let v of value) {
        clone.getQuery().addInclude(v);
      }
    } else {
      throw new Error("The argument for 'with' must be a string or an array of strings.");
    }

    return clone;
  }

  public orderBy(attribute: string, direction?: SortDirection | string): Builder {
    if (typeof direction === 'undefined' || direction === null) {
      direction = SortDirection.ASC;
    } else if (typeof direction === 'string') {
      if (direction === 'asc') {
        direction = SortDirection.ASC;
      } else if (direction === 'desc') {
        direction = SortDirection.DESC;
      } else {
        throw new Error(
          "The 'direction' parameter must be string of value 'asc' or 'desc', " +
          "value '" + direction + "' invalid."
        );
      }
    }

    const clone = this.clone();

    clone.getQuery().addSort(
      new SortSpec(
        attribute,
        direction === SortDirection.ASC
      )
    );

    return clone;
  }

  public option(queryParameter: string, value: string): Builder {
    const clone = this.clone();

    clone.getQuery().addOption(
      new Option(queryParameter, value)
    );

    return clone;
  }


  public clone(): Builder {
    let clone = Object.create(this);
    let query = new Query(this.query.getJsonApiType(), this.query.getQueriedRelationName(), this.query.getJsonApiId());

    this.query.getFilters().forEach(filter => query.addFilter(filter));
    this.query.getOptions().forEach(option => query.addOption(option));
    this.query.getSort().forEach(sort => query.addSort(sort));
    this.query.getInclude().forEach(include => query.addInclude(include));

    query.setPaginationSpec(Object.create(this.query.getPaginationSpec()));
    const limit = this.query.getLimit();
    if (limit !== undefined) {
      query.setLimit(limit);
    }

    clone.setQuery(query);

    return clone;
  }

  public getQuery(): Query {
    return this.query;
  }

  public setQuery(query: Query): void {
    this.query = query;
  }

  private initPaginationSpec(): void {
    //  let paginationStrategy = this.modelType.getPaginationStrategy();

    this.query.setPaginationSpec(
      new PageBasedPaginationSpec(
        this.modelType.getPaginationPageNumberParamName(),
        this.modelType.getPaginationPageSizeParamName(),
        this.modelType.getPageSize()
      )
    );
  }

  private getHttpClient(): HttpClient {
    return this.httpClient;
  }
}
