import bcrypt from 'bcryptjs'
import {
  AuthManager,
  AuthRepository,
  NotFoundError,
  User,
  UserAndPassword,
  UserAuth,
  InvalidUsername,
  InvalidUsernameOrPassword,
  DuplicatedUsername,
  InvalidPassword,
  UserAndRole,
} from '../types/user'
import {BaseResponse} from '../types/application'
import {
  getHash,
  validPassword,
  validUsername,
  validUserAndPassword,
} from './user'

export default class AuthManagerClass implements AuthManager {
  private authRepo: AuthRepository;

  constructor(authRepo: AuthRepository) {
    this.authRepo = authRepo
  }

  async hasUsername({username}: User): BaseResponse<UserAuth> {
    try {
      if (!validUsername(username)) throw InvalidUsername
      const user = await this.authRepo.read({username})
      return [user, null]
    } catch (error) {
      return [null, error]
    }
  }

  async delete({username}: User): BaseResponse<boolean> {
    try {
      const [, notExist] = await this.hasUsername({username})
      if (notExist) throw NotFoundError
      const deleted = await this.authRepo.delete({username})
      return [deleted, null]
    } catch (error) {
      return [null, error]
    }
  }

  async changePassword({
    username,
    password,
  }: UserAndPassword): BaseResponse<boolean> {
    try {
      if (!validUserAndPassword({username, password}))
        throw InvalidUsernameOrPassword

      const [, notExist] = await this.hasUsername({username})
      if (notExist) throw notExist

      const [passwordHash, error] = await this.hashPassword(password)
      if (error !== null) throw error

      const updated = await this.authRepo.update({
        username,
        passwordHash: passwordHash!,
      })
      return [updated, null]
    } catch (error) {
      return [null, error]
    }
  }

  async add({username, password}: UserAndPassword): BaseResponse<boolean> {
    try {
      if (!validUsername(username)) throw InvalidUsername
      const [exist, existError] = await this.hasUsername({
        username,
      })
      if (existError && existError.name !== NotFoundError.name)
        throw existError
      if (exist) throw DuplicatedUsername

      const [passwordHash, passwordHashError] = await this.hashPassword(
        password
      )
      if (passwordHashError !== null) throw passwordHashError

      const created = await this.authRepo.create({
        username,
        passwordHash: passwordHash!,
      })
      return [created, null]
    } catch (error) {
      return [null, error]
    }
  }

  async checkPassword({
    username,
    password,
  }: UserAndPassword): BaseResponse<boolean> {
    try {
      if (!validUserAndPassword({username, password}))
        throw InvalidUsernameOrPassword
      const userAuth = await this.authRepo.read({username})
      const validation = bcrypt.compareSync(password, userAuth.passwordHash)
      return [validation === true, null]
    } catch (error) {
      return [false, error]
    }
  }

  async list(): BaseResponse<UserAndRole[]> {
    try {
      const users = await this.authRepo.list()
      const usernames = users.map(({username, isAdmin}) => ({
        username,
        isAdmin,
      }))
      return [usernames, null]
    } catch (error) {
      return [null, error]
    }
  }

  async setAdministratorPermits(
    {username}: User,
    status = false
  ): BaseResponse<boolean> {
    try {
      const userAuth = await this.authRepo.read({username})
      userAuth.isAdmin = status

      const saved = await this.authRepo.update(userAuth)

      return [saved, null]
    } catch (error) {
      return [null, error]
    }
  }

  async isAdmin(user: User): BaseResponse<boolean> {
    try {
      const userAuth = await this.authRepo.read(user)
      return [userAuth.isAdmin === true, null]
    } catch (error) {
      return [null, error]
    }
  }

  private async hashPassword(password: string): BaseResponse<string> {
    try {
      if (!validPassword(password)) throw InvalidPassword
      const hash = getHash(password)
      return [hash, null]
    } catch (error) {
      return [null, error]
    }
  }
}
