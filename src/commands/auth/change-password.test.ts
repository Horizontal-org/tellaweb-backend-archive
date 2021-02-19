import {test, expect} from '@oclif/test'
import cli from 'cli-ux'
import fs from 'fs'

describe('auth:list', () => {
  afterEach(() => {
    fs.rmdirSync('./testData', {recursive: true})
  })

  test
  .stdout()
  .stub(cli, 'prompt', () => async () => 'somesecurepassword1')
  .command(['auth:add', '-u=testUser', '-d=testData', '-f=testData'])
  .command([
    'auth:change-password',
    '-u=testUser',
    '-d=testData',
    '-f=testData',
  ])
  .it('change the user password', ctx => {
    expect(ctx.stdout).to.contain('testUser')
  })

  test
  .stderr()
  .stub(cli, 'prompt', () => async () => 'somesecurepassword1')
  .command([
    'auth:change-password',
    '-u=userNotExist',
    '-d=testData',
    '-f=testData',
  ])
  .catch(error => {
    expect(error.message).to.be.equal('Password could not be changed')
  })
  .it('return error if the user is not found')
})
