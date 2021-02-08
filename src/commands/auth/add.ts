import BaseCommand from '../..'
import cli from 'cli-ux'
import {flags} from '@oclif/command'
import {OutputFlags} from '@oclif/parser'

export default class AddUserName extends BaseCommand {
  static description = "Add user authentication if doesn't already exist.";

  static flags = {
    ...BaseCommand.flags,
    username: flags.string({char: 'u', required: true}),
  };

  static args = [...BaseCommand.args];

  async run() {
    const {username} = this.parsedFlags as OutputFlags<
      typeof AddUserName.flags
    >

    try {
      const password = await cli.prompt('User password?', {
        type: 'hide',
        required: true,
      })
      if (!password) throw new Error('Username and password are required')

      const {error: addUserError} = await this.client.authManager.setPassword(
        username,
        password
      )

      if (addUserError) throw addUserError

      this.logAndExit(`User ${username} added`)
    } catch (error) {
      this.logAndExit(`Cant add ${username}`, error)
    }
  }
}
