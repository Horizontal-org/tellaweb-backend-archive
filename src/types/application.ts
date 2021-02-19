import * as log from "loglevel";

export type Logger = typeof log;
type ResponseOk<T> = [T, null];
type ResponseError = [null, Error];
type Response<T> = ResponseOk<T> | ResponseError;
export type BaseResponse<T> = Promise<Response<T>>;

export type ServerOptions = {
  port: number;
  address: string;
  key?: string;
  cert?: string;
};
