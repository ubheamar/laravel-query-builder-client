import {Model} from "../Model";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";
import {Response} from "./Response";
import {plainToClass} from "class-transformer";

export class SaveResponse extends Response
{
  protected readonly model: Model | null;

  constructor(
    httpClientResponse: HttpClientResponse,
    modelType: any,
    responseBody: object
  ) {
    super(undefined, httpClientResponse);
    const data = responseBody;
    if (data !== undefined && data !== null)
    {
      this.model = plainToClass(modelType, data);
    }
    else
    {
      this.model = null;
    }
  }

  public getModel(): Model | null
  {
    return this.model;
  }

  public getModelId(): string | undefined
  {
    return this.model !== null
      ?
      this.model.getId()
      :
      undefined;
  }
}
