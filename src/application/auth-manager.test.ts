import {AuthRepository} from '../types/user'
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

  it('should list the username and remove the password hash', async done => {
    when(mockedAuthRepo.list()).thenResolve([testUserAuth])

    const [list, error] = await authManager.list()
    expect(list).not.toBeNull()
    expect(error).toBeNull()
    expect(list!.length).toBe(1)
    expect(list![0]).not.toHaveProperty('passwordHash')

    done()
  })

  it('should return an error if the repository fail listing the users', async done => {
    when(mockedAuthRepo.list()).thenThrow(new Error('file system error'))

    const [list, error] = await authManager.list()
    expect(list).toBeNull()
    expect(error).not.toBeNull()
    expect(error!.message).toBe('file system error')

    done()
  })

  it('should find an user', async done => {
    const user = {username: testUser.username}
    when(mockedAuthRepo.read(deepEqual(user))).thenResolve(testUserAuth)

    const [exist, error] = await authManager.hasUsername(user)

    expect(error).toBeNull()
    expect(exist).toBeTruthy()

    done()
  })

  it('should return an error if the requested user is not found', async done => {
    when(mockedAuthRepo.read(deepEqual(testUser))).thenReject(
      new Error('User not found')
    )

    const [exist, error] = await authManager.hasUsername(testUser)

    expect(error).not.toBeNull()
    expect(exist).toBeNull()
    done()
  })

  it('should return an error if the user requested is invalid', async done => {
    const invalidUser = {username: '!#"$%&"'}
    const [exist, error] = await authManager.hasUsername(invalidUser)

    expect(error).not.toBeNull()
    expect(error!.message).toBe('Invalid username')
    expect(exist).toBeNull()

    verify(mockedAuthRepo.read(deepEqual(invalidUser))).never()

    done()
  })

  it('should add a new user', async done => {
    const NotFoundError = new Error()
    NotFoundError.name = 'NotFoundError'
    when(mockedAuthRepo.read(deepEqual(testUser))).thenThrow(NotFoundError)

    when(mockedAuthRepo.create(anything())).thenResolve(true)

    const [created, error] = await authManager.add(testUserAndPassword)

    expect(error).toBeNull()
    expect(created).toBeTruthy()

    verify(mockedAuthRepo.read(deepEqual(testUser))).once()
    verify(mockedAuthRepo.create(anything())).once()

    done()
  })

  it('should not add a duplicated user', async done => {
    const newUser = {username: 'newusername', password: 'somesecurepassword'}
    when(
      mockedAuthRepo.read(deepEqual({username: newUser.username}))
    ).thenResolve({
      username: 'newuser',
      passwordHash: 'hashoftheuserpassword',
    })

    const [created, error] = await authManager.add(newUser)

    expect(created).toBeNull()
    expect(error).not.toBeNull()
    expect(error!.message).toBe(`User ${newUser.username} already exist`)

    done()
  })

  it('should not be able to add a user with an invalid username', async done => {
    const invalidUser = {username: '#$#"%$', password: 'somesecurepassword'}

    const [created, error] = await authManager.add(invalidUser)

    expect(error).not.toBeNull()
    expect(created).toBeNull()

    verify(mockedAuthRepo.read(anything())).never()

    done()
  })

  it('should delete an user', async done => {
    when(mockedAuthRepo.read(anything())).thenResolve({
      username: 'u',
      passwordHash: 'p',
    })
    when(mockedAuthRepo.delete(anything())).thenResolve(true)

    const [deleted, error] = await authManager.delete({
      username: 'usertodelete',
    })

    expect(error).toBeNull()
    expect(deleted).toBeTruthy()

    done()
  })

  it('should not be able to delete a user that not exist', async done => {
    when(mockedAuthRepo.read(anything())).thenReject(
      new Error('User not found')
    )

    const [deleted, error] = await authManager.delete({
      username: 'usertodelete',
    })

    expect(error).not.toBeNull()
    expect(deleted).toBeNull()

    done()
  })

  it('should change the user password', async done => {
    when(mockedAuthRepo.read(anything())).thenResolve(testUserAuth)
    when(mockedAuthRepo.update(anything())).thenResolve(true)

    const [changed, error] = await authManager.changePassword(
      testUserAndPassword
    )

    expect(error).toBeNull()
    expect(changed).toBeTruthy()

    done()
  })

  it('should not be able to change the password if the user not exist', async done => {
    when(mockedAuthRepo.read(anything())).thenReject(
      new Error('User not found')
    )

    const [changed, error] = await authManager.changePassword(
      testUserAndPassword
    )

    expect(changed).toBeNull()
    expect(error).not.toBeNull()

    done()
  })

  it('should not be able to chenge the password if the password is invalid', async done => {
    const [changed, error] = await authManager.changePassword({
      username: 'u',
      password: '##"#$!',
    })

    verify(mockedAuthRepo.read(anything())).never()
    expect(changed).toBeNull()
    expect(error).not.toBeNull()

    done()
  })
})
