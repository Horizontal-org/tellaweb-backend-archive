import bcrypt from 'bcryptjs'
import {
  AuthManager,
  AuthRepository,
  NotFoundError,
  User,
  UserAndPassword,
  UserAuth,
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
    if (!validUsername(username)) return [null, new Error('Invalid username')]
    try {
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
        return [null, new Error('Invalid user or password')]

      const [, notExist] = await this.hasUsername({username})
      if (notExist) return [null, notExist]

      const [passwordHash, error] = await this.hashPassword(password)
      if (!passwordHash) throw new Error('Empty passwordHash')
      if (error) throw error

      const updated = await this.authRepo.update({username, passwordHash})
      return [updated, null]
    } catch (error) {
      return [null, error]
    }
  }

  async add({username, password}: UserAndPassword): BaseResponse<boolean> {
    try {
      if (!validUsername(username)) throw new Error('Invalid username')
      const [exist, existError] = await this.hasUsername({
        username,
      })
      if (existError && existError.name !== NotFoundError.name)
        throw existError
      if (exist) throw new Error(`User ${username} already exist`)

      const [passwordHash, passwordError] = await this.hashPassword(password)
      if (passwordError !== null) return [null, passwordError]

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
        throw new Error('User or password invalids')
      const userAuth = await this.authRepo.read({username})
      const validation = bcrypt.compareSync(password, userAuth.passwordHash)
      return [validation === true, null]
    } catch (error) {
      return [false, error]
    }
  }

  async list(): BaseResponse<User[]> {
    try {
      const users = await this.authRepo.list()
      const usernames = users.map(({username}) => ({username}))
      return [usernames, null]
    } catch (error) {
      return [null, error]
    }
  }

  private async hashPassword(password: string): BaseResponse<string> {
    try {
      if (!validPassword(password)) throw new Error('Invalid password')
      const hash = getHash(password)
      return [hash, null]
    } catch (error) {
      return [null, error]
    }
  }
}
