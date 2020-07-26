import {RetrievalResponse} from "./RetrievalResponse";
import {Model} from "../Model";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";
import {Query} from "../Query";

export class SingularResponse extends RetrievalResponse
{
    private _data: Model | null | undefined;

    constructor(
        query: Query,
        httpClientResponse: HttpClientResponse,
        modelType: any,
        responseBody: any
    ) {
        super(query, httpClientResponse, modelType, responseBody);
        if(responseBody)
          this.data = this.makeModel(responseBody);
    }


  get data(): Model | null | undefined {
    return this._data;
  }

  set data(value: Model | null | undefined) {
    this._data = value;
  }
}
