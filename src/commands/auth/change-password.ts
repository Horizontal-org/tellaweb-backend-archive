import cli from 'cli-ux'
import {OutputFlags} from '@oclif/parser'
import BaseCommand from '../..'
import {flags} from '@oclif/command'

export default class ChangePassword extends BaseCommand {
  static description = 'Change user authentication. Will prompt for password';

  static flags = {
    ...BaseCommand.flags,
    username: flags.string({char: 'u', required: true}),
  };

  async run() {
    const {username} = this.parsedFlags as OutputFlags<
      typeof ChangePassword.flags
    >

    try {
      const password = await cli.prompt('User password?', {
        type: 'hide',
        required: true,
      })
      if (!password) throw new Error('Username and password are required')

      const [, onChangeError] = await this.client.authManager.checkPassword({
        username,
        password,
      })

      if (onChangeError) throw onChangeError

      this.log('Password changed')
    } catch (error) {
      this.error('Password could not be changed')
    }
  }
}
