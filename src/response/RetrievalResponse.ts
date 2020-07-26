import {Model} from "../Model";
import {Response} from "./Response";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";
import {Query} from "../Query";
import {deserialize, plainToClass, plainToClassFromExist} from "class-transformer";
import ApiError from "../util/ApiError";

export abstract class RetrievalResponse extends Response {
  protected modelType: any;

  protected constructor(query: Query,
                        httpClientResponse: HttpClientResponse,
                        modelType: typeof Model,
                        responseBody: any
  ) {
    super(query, httpClientResponse);
    this.modelType = modelType;
  }

  makeModel(data: object):Model {
    let model:any =  plainToClass(this.modelType, data);
    if(!(model instanceof Model)){
      throw new ApiError();
    }
    return model;
    //let model: Model = new (<any> this.modelType);
   // model.populateFromResource(data);*!/
   // return plainToClass(this.modelType, data);
    //return deserialize(this.modelType,data);
  }

}
