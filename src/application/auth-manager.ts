import bcrypt from 'bcryptjs'
import {AuthManager, AuthRepository} from '../types'

export class AuthManagerClass implements AuthManager {
  private authRepo: AuthRepository;

  constructor(authRepo: AuthRepository) {
    this.authRepo = authRepo
  }

  async hasUsername(username: string) {
    try {
      const user = await this.authRepo.read(username)
      return {data: user}
    } catch (error) {
      return {error}
    }
  }

  async delete(username: string) {
    try {
      const {error: notExist} = await this.hasUsername(username)
      if (notExist) return {error: new Error('User not found')}

      await this.authRepo.delete(username)
      return {}
    } catch (error) {
      return {error}
    }
  }

  async setPassword(username: string, password: string) {
    try {
      const {data: passwordHash, error} = await this.hashPassword(password)
      if (passwordHash === undefined) return {error: 'Empty passwordHash'}
      if (error) return {error}
      const created = await this.authRepo.create({username, passwordHash})
      return {data: created}
    } catch (error) {
      return {error}
    }
  }

  async add(username: string, password: string) {
    try {
      const {data: exist, error: existError} = await this.hasUsername(
        username
      )
      if (existError && existError.name !== 'NotFoundError') throw existError
      if (exist) throw new Error(`User ${username} already exist`)

      return this.setPassword(username, password)
    } catch (error) {
      return {error}
    }
  }

  async checkPassword(username: string, password: string) {
    try {
      const userAuth = await this.authRepo.read(username)
      const isValid = bcrypt.compareSync(password, userAuth.passwordHash)
      return {data: isValid}
    } catch (error) {
      return {error}
    }
  }

  async list() {
    try {
      const users = await this.authRepo.list()
      return {data: users.map(user => user.username)}
    } catch (error) {
      return {error}
    }
  }

  private async hashPassword(password: string) {
    try {
      const hash = bcrypt.hashSync(password)
      return {data: hash}
    } catch (error) {
      return {error}
    }
  }
}
