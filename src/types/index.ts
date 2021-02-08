import log from 'loglevel'

export interface User {
  username: string;
}

export interface UserAuth extends User {
  passwordHash: string;
}

export type Logger = typeof log;

type BaseResponse<T> = {
  data?: T;
  error?: Error;
};

export interface AuthManager {
  hasUsername: (username: string) => Promise<BaseResponse<UserAuth>>;
  add: (username: string, password: string) => Promise<BaseResponse<boolean>>;
  setPassword: (
    username: string,
    password: string
  ) => Promise<BaseResponse<boolean>>;
  delete: (username: string) => Promise<BaseResponse<boolean>>;
  checkPassword: (
    username: string,
    password: string
  ) => Promise<BaseResponse<boolean>>;
  list: () => Promise<BaseResponse<string[]>>;
}

export interface AuthRepository {
  create: (user: UserAuth) => Promise<boolean>;
  read: (username: string) => Promise<UserAuth>;
  update: (user: UserAuth) => Promise<boolean>;
  delete: (username: string) => Promise<boolean>;
  list: () => Promise<UserAuth[]>;
}

export type Client = {
  authManager: AuthManager;
};
