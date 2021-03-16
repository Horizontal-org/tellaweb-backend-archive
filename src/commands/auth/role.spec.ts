import {test, expect} from '@oclif/test'
import cli from 'cli-ux'
import fs from 'fs'

describe('auth:role', () => {
  afterEach(() => {
    fs.rmdirSync('./testData', {recursive: true})
  })

  test
  .stdout()
  .stub(cli, 'prompt', () => async () => 'somesecurepassword1')
  .command(['auth:add', '-u=testUser', '-d=testData', '-f=testData'])
  .command(['auth:role', '-u=testUser', '-d=testData', '-f=testData'])
  .command(['auth:role', '-u=testUser', '-d=testData', '-f=testData'])
  .it('Remove admin role', ctx => {
    expect(ctx.stdout).to.contain('user')
  })

  test
  .stdout()
  .stub(cli, 'prompt', () => async () => 'somesecurepassword1')
  .command(['auth:add', '-u=testUser', '-d=testData', '-f=testData'])
  .command(['auth:role', '-u=testUser', '-d=testData', '-f=testData'])
  .it('Add admin role', ctx => {
    expect(ctx.stdout).to.contain('admin')
  })
})
