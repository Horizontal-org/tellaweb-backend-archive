import BaseCommand from '../..'
import {flags} from '@oclif/command'
import {OutputFlags} from '@oclif/parser'

export default class RoleUser extends BaseCommand {
  static description = 'Change user role';

  static flags = {
    ...BaseCommand.flags,
    username: flags.string({char: 'u', required: true}),
  };

  static args = [...BaseCommand.args];

  async run() {
    const {username} = this.parsedFlags as OutputFlags<typeof RoleUser.flags>
    try {
      const [isAdmin, adminError] = await this.client.authManager.isAdmin({
        username,
      })

      if (adminError) throw adminError

      const toggleRole = !isAdmin
      const [
        ,
        changedError,
      ] = await this.client.authManager.setAdministratorPermits(
        {username},
        toggleRole
      )

      if (changedError) throw changedError

      this.log(`User ${username} ${toggleRole ? 'is admin' : 'is user'}`)
    } catch (error) {
      this.logger.debug(error)
      this.error(`Cant add ${username}`, error)
    }
  }
}
