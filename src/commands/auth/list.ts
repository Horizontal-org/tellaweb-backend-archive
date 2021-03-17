import BaseCommand from '../..'

export default class ListUsers extends BaseCommand {
  static description = 'List usernames';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    this.logger.debug('Calling AuthManager.list')
    const [users, error] = await this.client.authManager.list()
    if (error || users?.length === 0) return this.log('Users not found', error)

    this.log(
      users!
      .map(
        ({username, isAdmin}) => `${username} ${isAdmin ? '(admin)' : ''}`
      )
      .join('\n')
    )
  }
}
