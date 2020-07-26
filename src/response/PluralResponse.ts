import {RetrievalResponse} from "./RetrievalResponse";
import {Model} from "../Model";
import {AxiosResponse} from "axios";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";
import {Query} from "../Query";

export class PluralResponse extends RetrievalResponse {
  private _data: Model[] = [];

  constructor(
    query: Query,
    httpClientResponse: HttpClientResponse,
    modelType: any,
    responseBody: any
  ) {
    super(query, httpClientResponse, modelType, responseBody);
    if (responseBody instanceof Array)
      this.makeDataArray(responseBody);
    else {
      this.makeDataArray(responseBody.data);
      this.updateQuery(responseBody.meta);
    }
  }

  makeDataArray(dataList: any) {
    dataList =  dataList.map((data: any) => {
      return this.makeModel(data);
    });
    this.data = dataList;
  }

  updateQuery(meta: any) {
    if (this.query)
      this.query.setTotal(meta.total);
  }

  get data(): Model[] {
    return this._data;
  }

  set data(value: Model[]) {
    this._data = value;
  }
}
