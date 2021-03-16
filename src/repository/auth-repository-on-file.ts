import {Logger} from '../types/application'
import fs from 'fs'
import path from 'path'
import {User, UserAuth, AuthRepository, NotFoundError} from '../types/user'

export class AuthRepositoryFs implements AuthRepository {
  private logger: Logger;

  private path: string;

  private authFile = '.credentials';

  constructor(path: string, logger: Logger) {
    this.logger = logger
    this.path = path
  }

  private getUserPath({username}: User) {
    return path.join(this.path, username)
  }

  async create(user: UserAuth): Promise<boolean> {
    const userPath = this.getUserPath(user)
    try {
      fs.mkdirSync(userPath, {
        mode: 0o777,
        recursive: true,
      })
      return this.update(user)
    } catch (error) {
      this.logger.debug('Error on user creation', error)
      return false
    }
  }

  async update(user: UserAuth): Promise<boolean> {
    const userPath = this.getUserPath(user)
    try {
      fs.writeFileSync(
        path.join(userPath, this.authFile),
        JSON.stringify(user, null, '  ')
      )

      return true
    } catch (error) {
      return false
    }
  }

  private getUserDataPath(user: User): string {
    const configPath = path.join(this.getUserPath(user), this.authFile)
    return configPath
  }

  async read(user: User): Promise<UserAuth> {
    return new Promise((res, rej) => {
      try {
        const userPath = this.getUserDataPath(user)
        this.logger.debug('Find user', user)
        this.logger.debug('Expected path', userPath)
        const exist = fs.existsSync(userPath)
        if (!exist) throw NotFoundError

        const rawdata = fs.readFileSync(userPath, 'utf8')
        this.logger.debug('Raw credentials found', rawdata)
        const jsondata = JSON.parse(rawdata)
        if (jsondata.username && jsondata.passwordHash)
          res({
            username: jsondata.username,
            passwordHash: jsondata.passwordHash,
            isAdmin: jsondata.isAdmin === true,
          })
        else throw NotFoundError
      } catch (error) {
        rej(error)
      }
    })
  }

  private isUserDir({username}: User): boolean {
    const userPath = this.getUserPath({username})
    try {
      const existDir = fs.statSync(path.join(userPath, this.authFile))
      if (existDir) return true
      return false
    } catch (_) {
      return false
    }
  }

  async list() {
    try {
      const userList = fs
      .readdirSync(this.path, {withFileTypes: true})
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({username: dirent.name}))
      .filter(user => this.isUserDir(user))

      const userAuthList = await Promise.all(
        userList.map(user => this.read(user))
      )

      return userAuthList
    } catch (error) {
      throw error
    }
  }

  async delete({username}: User) {
    const userPath = this.getUserPath({username})
    this.logger.debug('Delete user folder', userPath)
    try {
      fs.rmdirSync(userPath, {recursive: true})
      return true
    } catch (error) {
      this.logger.debug('User fs delete error', error)
      return false
    }
  }
}
