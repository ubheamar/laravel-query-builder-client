import {AxiosError, AxiosResponse} from "axios";


export default class ApiError extends Error {
  protected response?: AxiosError;

  constructor(object?: AxiosError) {
    super(`Api Error:${object}`);
    this.response = object;
  }

  getErrors() {

  }

  public getError() {

  }
}
