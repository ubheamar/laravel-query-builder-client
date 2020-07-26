
import {HttpClient} from "./httpclient/HttpClient";
import {AxiosHttpClient} from "./httpclient/axios/AxiosHttpClient";
import {Builder} from "./Builder";
import {PluralResponse} from "./response/PluralResponse";
import {SingularResponse} from "./response/SingularResponse";
import {Query} from "./Query";
import Errors from "./util/Errors";
import {HttpClientResponse} from "./httpclient/HttpClientResponse";
import {AxiosError} from "axios";
import {SaveResponse} from "./response/SaveResponse";
import ApiError from "./util/ApiError";
import {extractErrors, getFormData} from "./util/Utils";
import {getType, Property} from "reflect-helper";

import {classToClass, Exclude, Expose, plainToClass, serialize} from "class-transformer";
import {ToManyRelation} from "./relation/ToManyRelation";
import {ToOneRelation} from "./relation/ToOneRelation";
import {Reflection} from "./util/Reflection";
import ResourceAnnotation from "./refelction_helper/decorators/ResourceAnnotation";
import MediaAnnotation from "./refelction_helper/decorators/MediaAnnotation";





export interface Model {
  constructor: typeof Model;
}

export abstract class Model {
  @Exclude()
  private type: string;
//  [key: string]: any
  /**
   * @type {string} The JSON-API type, choose plural, lowercase alphabetic only, e.g. 'artists'
   */
  @Exclude()
  protected jsonApiType: string;
  /**
   * @type {number} the page size
   */
  protected static pageSize: number = 15;
  /**
   * @type {string} The number query parameter name. By default: 'page[number]'
   */
  protected static paginationPageNumberParamName: string = 'page[number]';

  /**
   * @type {string} The size query parameter name. By default: 'page[size]'
   */
  protected static paginationPageSizeParamName: string = 'page[size]';

  private static httpClient: HttpClient;

  @Expose()
  public id: string | undefined;


  @Exclude()
  protected errors: Errors = new Errors();

  constructor() {
    this.type = typeof this;
    this.jsonApiType = this.getResourceApiType();
    if (!Model.httpClient)
      Model.httpClient = new AxiosHttpClient();
    this.initHttpClient();
    this.errors = new Errors();
  }

  private initHttpClient(): void {
    Model.httpClient.setBaseUrl(this.getJsonApiBaseUrl());
  }

  private getResourceAnnotation(): ResourceAnnotation {
    if (!ResourceAnnotation.existsOnClass(this.constructor, true)) {
      throw new Error("Please add resource annotation to model")
    }
    const annotation: ResourceAnnotation = ResourceAnnotation.onClass(this.constructor, true)[0];
    return annotation;
  }

  public getResourceApiType(): string {
    let annotation = this.getResourceAnnotation();
    return <string>annotation.name;
  }

  public setJsonApiType(url: string) {
    this.jsonApiType = url;
  }

  public getJsonApiType(): string {
    return this.jsonApiType;
  }

  /**
   * Get a {@link Builder} instance from a {@link Model} instance
   * so you can query without having a static reference to your specific {@link Model}
   * class.
   */
  public query(): Builder {
    return this.constructor.query();
  }

  /**
   * Get a {@link Builder} instance from a static {@link Model}
   * so you can start querying
   */
  public static query(query?: Query | undefined): Builder {

    let builder = new Builder(this);
    if (query) {
      builder.setQuery(query);
      return builder;
    }
    return builder;
  }

  public static get(page?: number): Promise<PluralResponse> {
    return <Promise<PluralResponse>>new Builder(this)
      .get(page);
  }

  public static first(): Promise<SingularResponse> {
    return new Builder(this)
      .first();
  }

  public static find(id: string | number): Promise<SingularResponse> {
    return new Builder(this)
      .find(id);
  }

  public static delete(ids: any): Promise<void> {
    return new Builder(this)
      .deleteRecords(ids);
  }

  public save(): Promise<SaveResponse> {
    this.errors.clear();
    if (!this.hasId) {
      return this.create();
    }

    let payload = this.serializePayload();
    return Model.httpClient
      .patch(
        this.getJsonApiType() + '/' + this.id,
        payload
      )
      .then(
        (response: HttpClientResponse) => {
          const idFromJson: string | undefined = response.getData().id;
          this.setId(idFromJson);
          return new SaveResponse(response, this.constructor, response.getData());
        },
        (response: AxiosError) => {
          this.errors.errors = extractErrors(response.response);
          throw new ApiError(response);
        }
      );
  }

  private getMediaProperties(object: Model): Property[] {
    let properties: Property[] = [];
    let type = getType(object.constructor);
    type.properties.forEach((property) => {
      if (property.hasAnnotation(MediaAnnotation)) {
        properties.push(property);
      }
    });
    return properties;
  }

  serializePayload() {
    let payload: any = serialize(this);
    let annotation = this.getResourceAnnotation();
    if (annotation && annotation.hasMedia) {
      payload = JSON.parse(payload);
      this.getMediaProperties(this).forEach((property) => {
        payload[property.name] = property.getValue(this)
      });
      payload = getFormData(payload);
    }
    return payload;
  }

  public create(): Promise<SaveResponse> {
    let payload = this.serializePayload();
    return Model.httpClient
      .post(
        this.getJsonApiType(),
        payload
      )
      .then(
        (response: HttpClientResponse) => {
          const idFromJson: string | undefined = response.getData().id;
          this.setId(idFromJson);
          return new SaveResponse(response, this.constructor, response.getData());
        },
        (response: AxiosError) => {
          this.errors.errors = extractErrors(response.response);
          throw new ApiError(response);
        }
      );
  }

  public delete(): Promise<void> {
    if (!this.hasId) {
      throw new Error('Cannot delete a model with no ID.');
    }
    return Model.httpClient
      .delete(this.getJsonApiType() + '/' + this.id)
      .then(function (response: HttpClientResponse) {
      });
  }


  public static with(attribute: any): Builder {
    return new Builder(this)
      .with(attribute);
  }

  public static limit(limit: number): Builder {
    return new Builder(this)
      .limit(limit);
  }

  public static where(attribute: string, value: string): Builder {
    return new Builder(this)
      .where(attribute, value);
  }

  public static orderBy(attribute: string, direction?: string): Builder {
    return new Builder(this)
      .orderBy(attribute, direction);
  }

  public static option(queryParameter: string, value: string): Builder {
    return new Builder(this)
      .option(queryParameter, value);
  }

  /**
   * @returns {string} e.g. 'http://www.foo.com/bar/'
   */
  public abstract getJsonApiBaseUrl(): string;

  /**
   * Allows you to get the current HTTP client (AxiosHttpClient by default), e.g. to alter its configuration.
   * @returns {HttpClient}
   */
  public static getHttpClient(): HttpClient {
    return this.httpClient;
  }

  /**
   * Allows you to use any HTTP client library, as long as you write a wrapper for it that implements the interfaces
   * HttpClient, HttpClientPromise and HttpClientResponse.
   * @param httpClient
   */
  public static setHttpClient(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }


  public getId(): string | undefined {
    return this.id;
  }


  public static getPaginationPageNumberParamName(): string {
    return this.paginationPageNumberParamName;
  }

  public static getPaginationPageSizeParamName(): string {
    return this.paginationPageSizeParamName;
  }

  public static getPageSize(): number {
    return this.pageSize;
  }


  public setId(id: string | undefined): void {
    this.id = id;
  }

  private get hasId(): boolean {
    return this.id !== undefined
      && this.id !== null
      && this.id !== '';
  }

  protected hasMany(relatedType: typeof Model): ToManyRelation;
  protected hasMany(relatedType: typeof Model, relationName: string): ToManyRelation;
  protected hasMany(relatedType: typeof Model, relationName?: string): ToManyRelation {
    if (typeof relationName === 'undefined') {
      relationName = Reflection.getNameOfNthMethodOffStackTrace(new Error(), 2);
    }
    return new ToManyRelation(relatedType, this, relationName);
  }

  protected hasOne(relatedType: typeof Model): ToOneRelation;
  protected hasOne(relatedType: typeof Model, relationName: string): ToOneRelation;
  protected hasOne(relatedType: typeof Model, relationName?: string): ToOneRelation {
    if (typeof relationName === 'undefined') {
      relationName = Reflection.getNameOfNthMethodOffStackTrace(new Error(), 2);
    }
    return new ToOneRelation(relatedType, this, relationName);
  }

  public for(models: Model[]): Model {
    var url = "";
    models.forEach((model) => {
      url += `/${model.getJsonApiType()}/${model.getId()}`
    });
    url += `/${this.getResourceApiType()}`;
    this.setJsonApiType(url);
    return this;
  }
}
