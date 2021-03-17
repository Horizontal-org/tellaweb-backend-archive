import {BaseResponse} from './application'

export interface User {
  username: string;
}

export interface UserAndPassword extends User {
  password: string;
}

export interface UserAndRole extends User {
  isAdmin?: boolean;
}

export interface UserAuth extends UserAndRole {
  passwordHash: string;
}

export interface AuthManager {
  hasUsername: (data: User) => BaseResponse<UserAuth>;
  isAdmin: (data: User) => BaseResponse<boolean>;
  add: (data: UserAndPassword) => BaseResponse<boolean>;
  changePassword: (data: UserAndPassword) => BaseResponse<boolean>;
  delete: (data: User) => BaseResponse<boolean>;
  checkPassword: (data: UserAndPassword) => BaseResponse<boolean>;
  list: () => BaseResponse<UserAndRole[]>;
  setAdministratorPermits: (
    data: User,
    status: boolean
  ) => BaseResponse<boolean>;
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

export const InvalidPassword = new Error('Password invalid')
InvalidPassword.name = 'InvalidPassword'

export const InvalidUsername = new Error('Username invalid')
InvalidUsername.name = 'InvalidUsername'

export const InvalidUsernameOrPassword = new Error(
  'Username or password are invalid'
)

export const UserIsntAdmin = new Error(
  'The user does not have administrator permissions'
)

InvalidUsernameOrPassword.name = 'InvalidUsernameOrPassword'

export const DuplicatedUsername = new Error('Username already exist')
DuplicatedUsername.name = 'DuplicatedUsername'
