import {test, expect} from '@oclif/test'
import cli from 'cli-ux'
import fs from 'fs'

describe('auth:add', () => {
  afterEach(() => {
    fs.rmdirSync('./testData', {recursive: true})
  })

  test
  .stdout()
  .stub(cli, 'prompt', () => async () => 'somesecurepassword1')
  .command(['auth:add', '-u=testUser', '-d=testData', '-f=testData'])
  .it('add the username', ctx => {
    expect(ctx.stdout).to.contain('added')
  })

  test
  .stderr()
  .stub(cli, 'prompt', () => async () => 'some invalid #"!! password')
  .command(['auth:add', '-u=testUser', '-d=testData', '-f=testData'])
  .catch(error => {
    expect(error.message).to.contain('Cant add testUser')
  })
  .it('Not add the username with an invalid password')

  test
  .stderr()
  .stub(cli, 'prompt', () => async () => 'somevalidpassword1')
  .command(['auth:add', '-u=testInvalid!$"', '-d=testData', '-f=testData'])
  .catch(error => {
    expect(error.message).to.contain('Cant add testInvalid!$')
  })
  .it('Not add the user if the name is invialid')

  test
  .stderr()
  .stub(cli, 'prompt', () => async () => 'somevalidpassword1')
  .command(['auth:add', '-u=testUser', '-d=testData', '-f=testData'])
  .command(['auth:add', '-u=testUser', '-d=testData', '-f=testData'])
  .catch(error => {
    expect(error.message).to.contain('Cant add testUser')
  })
  .it('Cant add a duplicated username')
})
