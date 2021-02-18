import {flags, Command} from '@oclif/command'
export {run} from '@oclif/command'
import {createLogger} from './logger'
import {AuthManagerClass} from './application/auth-manager'
import {AuthRepositoryClass} from './repository/auth-repository'
import {Input, OutputArgs, OutputFlags} from '@oclif/parser'
import {Client} from './types/command'
import {Logger} from './types/application'
import {AuthRepositoryFs} from './repository/auth-repository-on-file'

export default abstract class BaseCommand extends Command {
  exit(code?: number) {
    return process.exit(code)
  }

  public client!: Client;

  public logger!: Logger;

  static flags = {
    verbose: flags.boolean({
      char: 'l',
      env: 'VERBOSE',
    }),
    files: flags.string({
      char: 'f',
      env: 'FILES_DIR',
      default: 'data',
    }),
    db: flags.string({
      char: 'd',
      env: 'DB_NAME',
      default: 'db',
    }),
  };

  static args = [];

  protected parsedArgs?: OutputArgs<any>;

  protected parsedFlags?: OutputFlags<typeof BaseCommand.flags>;

  async init() {
    const {args, flags} = this.parse(
      this.constructor as Input<typeof BaseCommand.flags>
    )
    this.parsedArgs = args
    this.parsedFlags = flags

    this.logger = createLogger(this.parsedFlags.verbose)
    const ar = new AuthRepositoryFs(this.parsedFlags.files, this.logger)
    // const ar = new AuthRepositoryClass(this.parsedFlags.db, this.logger)
    const am = new AuthManagerClass(ar)

    this.client = {authManager: am}
  }

  logAndExit(message: string, error?: Error) {
    this.log(message)
    if (error) this.logger.debug(error)

    this.exit(error ? 1 : 0)
  }
}
