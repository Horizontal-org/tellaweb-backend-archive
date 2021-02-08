import {validUsername} from '../application/user'
import {UserAuth, AuthRepository, Logger} from '../types'
import Level from 'level-js'
import level from 'level'

export class AuthRepositoryClass implements AuthRepository {
  private logger: Logger;

  private db: Level;

  constructor(db: string, logger: Logger) {
    this.logger = logger
    this.db = level(db, {valueEncoding: 'json'})
  }

  async create(user: UserAuth) {
    return this.update(user)
  }

  getDb() {
    return this.db
  }

  update(user: UserAuth) {
    return new Promise<boolean>((res, rej) => {
      if (!validUsername(user.username)) rej(new Error('Invalid username'))

      try {
        this.db.put(user.username, user, error => {
          if (error) return res(false)
          this.logger.debug('Update UserAuth in DB', user.username)
          return res(true)
        })
      } catch (_) {
        return res(false)
      }
    })
  }

  delete(username: string) {
    return new Promise<boolean>(res => {
      try {
        this.db.del(username, error => {
          if (error) return res(false)
          this.logger.debug('Delete UserAuth in DB', username)
          return res(true)
        })
      } catch (_) {
        return res(false)
      }
    })
  }

  list() {
    return new Promise<UserAuth[]>((res, rej) => {
      const userList: UserAuth[] = []
      try {
        this.db
        .createReadStream()
        .on('data', ({value}: { value: UserAuth }) => userList.push(value))
        .on('close', () => res(userList))
        .on('error', (error: Error) => {
          this.logger.error('Error listing users', error)
          rej(error)
        })
      } catch (error) {
        rej(error)
      }
    })
  }

  read(username: string) {
    return new Promise<UserAuth>((res, rej) => {
      if (!validUsername(username)) rej(new Error('Invalid username'))

      this.db.get(username, (error, user?: UserAuth) => {
        if (error !== null) return rej(error)
        if (user) return res(user)
      })
    })
  }
}
