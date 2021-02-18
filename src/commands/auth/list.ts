import BaseCommand from '../..'

export default class ListUsers extends BaseCommand {
  static description = 'List usernames';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    this.logger.debug('Calling AuthManager.list')
    const [users, error] = await this.client.authManager.list()
    if (error) this.logAndExit('Users not found', error)

    this.logAndExit(users!.map(({username}) => username).join('\n'))
    this.exit(0)
  }
}
