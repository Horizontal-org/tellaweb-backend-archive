import {test, expect} from '@oclif/test'
import cli from 'cli-ux'
import fs from 'fs'

describe('auth:del', () => {
  afterEach(() => {
    fs.rmdirSync('./testData', {recursive: true})
  })

  test
  .stdout()
  .stub(cli, 'prompt', () => async () => 'somesecurepassword1')
  .command(['auth:add', '-u=testUser', '-d=testData', '-f=testData'])
  .stub(cli, 'confirm', () => async () => true)
  .command(['auth:del', '-u=testUser', '-d=testData', '-f=testData'])
  .it('delete the username', ctx => {
    expect(ctx.stdout).to.contain('added')
  })

  test
  .stderr()
  .command(['auth:del', '-u=testUser', '-d=testData', '-f=testData'])
  .catch(error => {
    expect(error.message).to.contain('Cant delete testUser')
  })
  .it('not delete the user if the user not exist')
})
