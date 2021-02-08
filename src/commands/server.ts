import {Command, flags} from '@oclif/command'

export default class Server extends Command {
  static description = 'Start Tella Direct Upload Server';

  static flags = {
    help: flags.help({char: 'h'}),

    address: flags.string({
      char: 'a',
      default: ':8080',
      description: 'address for server to bind to',
    }),
    cert: flags.string({
      char: 'c',
      env: 'CERT',
      description: 'certificate file, ie. ./fullcert.pem',
    }),
    database: flags.string({
      char: 'd',
      default: './direct-upload.db',
      description: 'direct-upload database file',
    }),
    files: flags.string({
      char: 'f',
      env: 'FILES',
      description: 'path where direct-upload server stores uploaded files',
    }),
    key: flags.string({
      char: 'k',
      env: 'KEY',
      description: 'private key file, ie: ./key.pem',
    }),
  };

  static args = [{name: 'file'}];

  async run() {
    const {args, flags} = this.parse(Server)
  }
}
