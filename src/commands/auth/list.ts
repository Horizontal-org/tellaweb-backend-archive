import BaseCommand from '../..'

export default class ListUsers extends BaseCommand {
  static description = 'List usernames';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    this.logger.debug('Calling AuthManager.list')
    const {data, error} = await this.client.authManager.list()
    if (typeof data === 'undefined') this.logAndExit('Users not found', error)

    this.logAndExit(data!.join('\n'))
    this.exit(0)
  }
}
