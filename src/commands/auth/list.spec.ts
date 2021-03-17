import {test, expect} from '@oclif/test'
import cli from 'cli-ux'
import fs from 'fs'

describe('list:add', () => {
  afterEach(() => {
    fs.rmdirSync('./testData', {recursive: true})
  })

  test
  .stub(cli, 'prompt', () => async () => 'somesecurepassword1')
  .stdout()
  .command(['auth:add', '-u=testUser', '-d=testData', '-f=testData'])
  .command(['auth:list', '-d=testData', '-f=testData'])
  .it('list the current users', ctx => {
    expect(ctx.stdout).to.contain('testUser')
  })

  test
  .stub(cli, 'prompt', () => async () => 'somesecurepassword1')
  .stdout()
  .command(['auth:add', '-u=testUser', '-d=testData', '-f=testData'])
  .command(['auth:role', '-u=testUser', '-d=testData', '-f=testData'])
  .command(['auth:list', '-d=testData', '-f=testData'])
  .it('identify the admin/s user', ctx => {
    expect(ctx.stdout).to.contain('testUser (admin)')
  })

  test
  .stub(cli, 'prompt', () => async () => 'somesecurepassword1')
  .stdout()
  .command(['auth:list', '-d=testData', '-f=testData'])
  .it('report that there are no users in the storage', ctx => {
    expect(ctx.stdout).to.contain('not found')
  })
})
