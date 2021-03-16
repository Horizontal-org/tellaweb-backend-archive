import {
  AuthRepository,
  NotFoundError,
  InvalidUsername,
  DuplicatedUsername,
} from '../types/user'
import AuthManagerClass from './auth-manager'
import {
  mock,
  instance,
  reset,
  when,
  deepEqual,
  verify,
  anything,
} from 'ts-mockito'
import {getHash} from './user'
import {expect} from 'chai'

describe('Test AuthManager implementation', () => {
  const mockedAuthRepo: AuthRepository = mock<AuthRepository>()
  const authRepo = instance(mockedAuthRepo)
  const testUser = {username: 'testUser'}
  const testUserAndPassword = {
    ...testUser,
    password: 'testPassword1',
  }

  const testUserAuth = {
    ...testUser,
    passwordHash: getHash(testUserAndPassword.password),
  }

  const authManager = new AuthManagerClass(authRepo)

  afterEach(() => {
    reset(mockedAuthRepo)
  })

  it('should list the username and remove the password hash', async () => {
    when(mockedAuthRepo.list()).thenResolve([testUserAuth])

    const [list, error] = await authManager.list()
    expect(list).not.to.be.null
    expect(error).to.be.null
    expect(list!.length).to.be.equal(1)
    expect(list![0]).not.to.haveOwnProperty('passwordHash')
  })

  it('should return an error if the repository fail listing the users', async () => {
    when(mockedAuthRepo.list()).thenThrow(new Error('file system error'))

    const [list, error] = await authManager.list()
    expect(list).to.be.null
    expect(error).not.to.be.null
    expect(error!.message).to.be.equal('file system error')
  })

  it('should find an user', async () => {
    const user = {username: testUser.username}
    when(mockedAuthRepo.read(deepEqual(user))).thenResolve(testUserAuth)

    const [exist, error] = await authManager.hasUsername(user)

    expect(error).to.be.null
    expect(exist).to.not.be.null
  })

  it('should return an error if the requested user is not found', async () => {
    when(mockedAuthRepo.read(deepEqual(testUser))).thenReject(NotFoundError)

    const [exist, error] = await authManager.hasUsername(testUser)

    expect(error).not.to.be.null
    expect(exist).to.be.null
  })

  it('should return an error if the user requested is invalid', async () => {
    const invalidUser = {username: '!#"$%&"'}
    const [exist, error] = await authManager.hasUsername(invalidUser)

    expect(error).not.to.be.null
    expect(error).to.be.equal(InvalidUsername)
    expect(exist).to.be.null

    verify(mockedAuthRepo.read(deepEqual(invalidUser))).never()
  })

  it('should add a new user', async () => {
    when(mockedAuthRepo.read(deepEqual(testUser))).thenThrow(NotFoundError)

    when(mockedAuthRepo.create(anything())).thenResolve(true)

    const [created, error] = await authManager.add(testUserAndPassword)

    expect(error).to.be.null
    expect(created).to.be.true

    verify(mockedAuthRepo.read(deepEqual(testUser))).once()
    verify(mockedAuthRepo.create(anything())).once()
  })

  it('should not add a duplicated user', async () => {
    const newUser = {username: 'newusername', password: 'somesecurepassword'}
    when(
      mockedAuthRepo.read(deepEqual({username: newUser.username}))
    ).thenResolve({
      username: 'newuser',
      passwordHash: 'hashoftheuserpassword',
    })

    const [created, error] = await authManager.add(newUser)

    expect(created).to.be.null
    expect(error).not.to.be.null
    expect(error).to.be.equal(DuplicatedUsername)
  })

  it('should not be able to add a user with an invalid username', async () => {
    const invalidUser = {username: '#$#"%$', password: 'somesecurepassword'}

    const [created, error] = await authManager.add(invalidUser)

    expect(error).not.to.be.null
    expect(created).to.be.null

    verify(mockedAuthRepo.read(anything())).never()
  })

  it('should delete an user', async () => {
    when(mockedAuthRepo.read(anything())).thenResolve({
      username: 'u',
      passwordHash: 'p',
    })
    when(mockedAuthRepo.delete(anything())).thenResolve(true)

    const [deleted, error] = await authManager.delete({
      username: 'usertodelete',
    })

    expect(error).to.be.null
    expect(deleted).to.be.true
  })

  it('should not be able to delete a user that not exist', async () => {
    when(mockedAuthRepo.read(anything())).thenReject(NotFoundError)

    const [deleted, error] = await authManager.delete({
      username: 'usertodelete',
    })

    expect(error).not.to.be.null
    expect(deleted).to.be.null
  })

  it('should change the user password', async () => {
    when(mockedAuthRepo.read(anything())).thenResolve(testUserAuth)
    when(mockedAuthRepo.update(anything())).thenResolve(true)

    const [changed, error] = await authManager.changePassword(
      testUserAndPassword
    )

    expect(error).to.be.null
    expect(changed).to.be.true
  })

  it('should not be able to change the password if the user not exist', async () => {
    when(mockedAuthRepo.read(anything())).thenReject(NotFoundError)

    const [changed, error] = await authManager.changePassword(
      testUserAndPassword
    )

    expect(changed).to.be.null
    expect(error).not.to.be.null
  })

  it('should not be able to chenge the password if the password is invalid', async () => {
    when(mockedAuthRepo.read(anything())).thenReject(NotFoundError)
    const [changed, error] = await authManager.changePassword({
      username: 'u',
      password: '##"#$!',
    })

    verify(mockedAuthRepo.read(anything())).never()
    expect(changed).to.be.null
    expect(error).not.to.be.null
  })

  it('should be able to add administrative permision to any user', async () => {
    when(mockedAuthRepo.read(anything())).thenResolve(testUserAuth)
    when(mockedAuthRepo.update(anything())).thenResolve(true)

    const isAdmin = true
    const [added, error] = await authManager.setAdministratorPermits(
      testUser,
      isAdmin
    )

    expect(added).to.be.true
    expect(error).to.be.null

    verify(
      mockedAuthRepo.update(deepEqual({...testUserAuth, isAdmin}))
    ).once()
  })

  it('should be able to return the user role', async () => {
    when(mockedAuthRepo.read(anything())).thenResolve({
      ...testUserAuth,
      isAdmin: false,
    })

    const [isAdmin, error] = await authManager.isAdmin(testUser)

    expect(isAdmin).to.be.false
    expect(error).to.be.null
  })
})
