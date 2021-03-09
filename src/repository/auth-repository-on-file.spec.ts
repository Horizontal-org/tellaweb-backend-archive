import {AuthRepositoryFs} from './auth-repository-on-file'
import mockFs from 'mock-fs'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import {NotFoundError} from '../types/user'
import {createLogger} from '../logger'
import {expect} from 'chai'

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
  })

  afterEach(() => {
    mockFs.restore()
  })

  const logger = createLogger(false)

  const authStorage = new AuthRepositoryFs(dataFolder, logger)

  it('should save an new account', async () => {
    const created = await authStorage.create({
      username: testUser.username,
      passwordHash: hashPassword(testUser.password),
    })

    expect(created).to.be.true

    const credentialsFileExist = fs.existsSync(
      path.join(dataFolder, testUser.username, '.credentials')
    )

    expect(credentialsFileExist).to.be.true
  })

  it('should get the user credentials if exist', async () => {
    const userAuth = await authStorage.read({username: oldUser.username})
    expect(userAuth.username).to.be.equal(oldUserCredentials.username)
    expect(userAuth.passwordHash).to.be.equal(oldUserCredentials.passwordHash)
  })

  it('should throw error if the user not exist', async () => {
    try {
      await authStorage.read({
        username: 'thisUserNotExist',
      })
      expect(false).to.be.true // If call this is an error
    } catch (error) {
      expect(error).to.be.equal(NotFoundError)
    }
  })

  it('should get a list of the current users and credentials', async () => {
    const list = await authStorage.list()
    expect(list.length).to.be.equal(1)
  })

  it('should only folders with credentials files be consider as users', async () => {
    // creates an empty folder in the user directory
    fs.mkdirSync(path.join(dataFolder, 'notUserFolder'))
    const totalFolders = fs
    .readdirSync(dataFolder, {withFileTypes: true})
    .filter(el => el.isDirectory()).length

    const userList = await authStorage.list()

    expect(userList).to.not.null
    expect(userList.length).to.be.lessThan(totalFolders)
  })

  it('should remove the user data', async () => {
    const prevUserList = await authStorage.list()

    const deleted = await authStorage.delete(oldUser)
    expect(deleted).to.be.true

    const actualUserList = await authStorage.list()

    expect(actualUserList.length).to.be.lessThan(prevUserList.length)
    expect(actualUserList.find(user => user.username === oldUser.username)).to
    .be.undefined
  })

  it('should update the credentials', async () => {
    const newPassword = hashPassword('newPassword')
    const prevUser = await authStorage.read(oldUser)

    const updated = await authStorage.update({
      username: oldUser.username,
      passwordHash: newPassword,
    })

    expect(updated).to.be.true

    const actualUser = await authStorage.read(oldUser)
    expect(actualUser.passwordHash).to.be.equal(newPassword)
    expect(prevUser.passwordHash).not.to.be.equal(newPassword)
  })
})
