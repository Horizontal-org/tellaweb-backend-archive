import {AuthRepositoryFs} from './auth-repository-on-file'
import log from 'logger'
import mockFs from 'mock-fs'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import {NotFoundError} from '../types/user'

const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

describe('Auth storage using files', () => {
  const dataFolder = 'data'
  const testUser = {username: 'testUser', password: 'testPassword'}
  const oldUser = {username: 'oldUser', password: 'oldPassword'}
  const oldUserCredentials = {
    username: oldUser.username,
    passwordHash: hashPassword(oldUser.password),
  }

  const fileSystem = {
    [dataFolder]: {
      [oldUser.username]: {
        '.credentials': JSON.stringify(oldUserCredentials),
      },
    },
  }

  beforeEach(() => {
    mockFs(fileSystem)
    jest.clearAllMocks()
  })

  afterAll(() => {
    mockFs.restore()
  })

  const logger = {
    debug: jest.fn(),
  } as jest.Mocked<typeof log>

  const authStorage = new AuthRepositoryFs(dataFolder, logger)

  it('should save an new account', async done => {
    const created = await authStorage.create({
      username: testUser.username,
      passwordHash: hashPassword(testUser.password),
    })

    expect(created).toBeTruthy()

    const credentialsFileExist = fs.existsSync(
      path.join(dataFolder, testUser.username, '.credentials')
    )

    expect(credentialsFileExist).toBeTruthy()

    done()
  })

  it('should get the user credentials if exist', async done => {
    const userAuth = await authStorage.read({username: oldUser.username})
    expect(userAuth.username).toBe(oldUserCredentials.username)
    expect(userAuth.passwordHash).toBe(oldUserCredentials.passwordHash)

    done()
  })

  it('should throw error if the user not exist', async done => {
    try {
      await authStorage.read({
        username: 'thisUserNotExist',
      })
      expect(false).toBeTruthy() // If call this is an error
      done()
    } catch (error) {
      expect(error.message).toBe(NotFoundError.message)
      done()
    }
  })

  it('should get a list of the current users and credentials', async done => {
    const list = await authStorage.list()
    expect(list.length).toBe(1)

    done()
  })

  it('should only folders with credentials files be consider as users', async done => {
    // creates an empty folder in the user directory
    fs.mkdirSync(path.join(dataFolder, 'notUserFolder'))
    const totalFolders = fs
    .readdirSync(dataFolder, {withFileTypes: true})
    .filter(el => el.isDirectory()).length

    const userList = await authStorage.list()

    expect(userList).toBeTruthy()
    expect(userList.length).toBeLessThan(totalFolders)

    done()
  })

  it('should remove the user data', async done => {
    const prevUserList = await authStorage.list()

    const deleted = await authStorage.delete(oldUser)
    expect(deleted).toBeTruthy()

    const actualUserList = await authStorage.list()

    expect(actualUserList.length).toBeLessThan(prevUserList.length)

    expect(
      actualUserList.find(user => user.username === oldUser.username)
    ).toBeFalsy()

    done()
  })

  it('should update the credentials', async done => {
    const newPassword = hashPassword('newPassword')
    const prevUser = await authStorage.read(oldUser)

    const updated = await authStorage.update({
      username: oldUser.username,
      passwordHash: newPassword,
    })

    expect(updated).toBeTruthy()

    const actualUser = await authStorage.read(oldUser)
    expect(actualUser.passwordHash).toBe(newPassword)
    expect(prevUser.passwordHash).not.toBe(newPassword)

    done()
  })
})
