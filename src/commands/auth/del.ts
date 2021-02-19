import BaseCommand from '../..'
import {flags} from '@oclif/command'
import {OutputFlags} from '@oclif/parser'
import cli from 'cli-ux'

export default class DeleteUser extends BaseCommand {
  static description = 'Delete user authentication';

  static flags = {
    ...BaseCommand.flags,
    username: flags.string({char: 'u', required: true}),
  };

  static args = [...BaseCommand.args];

  async run() {
    const {username} = this.parsedFlags as OutputFlags<
      typeof DeleteUser.flags
    >

    try {
      const [, notExist] = await this.client.authManager.hasUsername({
        username,
      })
      if (notExist !== null) throw notExist
      const confirmation = await cli.confirm(
        'Are you sure you want to delete the user and all his data? (yes/no)'
      )

      if (!confirmation) this.exit(0)

      const [, deletedError] = await this.client.authManager.delete({
        username,
      })

      if (deletedError) throw deletedError
      this.log(`${username} deleted`)
    } catch (error) {
      this.error(`Cant delete ${username}`)
    }
  }
}
