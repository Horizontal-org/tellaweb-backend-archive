import {BaseResponse} from './application'

export interface User {
  username: string;
}

export interface UserAndPassword extends User {
  password: string;
}

export interface UserAuth extends User {
  passwordHash: string;
}

export interface AuthManager {
  hasUsername: (data: User) => BaseResponse<UserAuth>;
  add: (data: UserAndPassword) => BaseResponse<boolean>;
  changePassword: (data: UserAndPassword) => BaseResponse<boolean>;
  delete: (data: User) => BaseResponse<boolean>;
  checkPassword: (data: UserAndPassword) => BaseResponse<boolean>;
  list: () => BaseResponse<User[]>;
}

export interface AuthRepository {
  create: (data: UserAuth) => Promise<boolean>;
  read: (data: User) => Promise<UserAuth>;
  update: (data: UserAuth) => Promise<boolean>;
  delete: (data: User) => Promise<boolean>;
  list: () => Promise<UserAuth[]>;
}

export const NotFoundError = new Error('User not found')
NotFoundError.name = 'NotFoundError'
