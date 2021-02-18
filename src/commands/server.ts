import {OutputFlags} from '@oclif/parser'
import express from 'express'
import {AuthManagerClass} from '../application/auth-manager'
import {FileStorageClass} from '../repository/file-repository'
import {ExpressServer} from '../server/http'
import fs from 'fs'
import https from 'https'
import {ServerOptions} from '../types/application'
import BaseCommand from '..'
import {flags} from '@oclif/command'
import {AuthRepositoryFs} from '../repository/auth-repository-on-file'

export default class Server extends BaseCommand {
  static description = 'Start Tella Direct Upload Server';

  static flags = {
    ...BaseCommand.flags,
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
      default: './data',
      description: 'path where direct-upload server stores uploaded files',
    }),
    key: flags.string({
      char: 'k',
      env: 'KEY',
      description: 'private key file, ie: ./key.pem',
    }),
  };

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof Server.flags>

    const serverOptions: ServerOptions = {
      port: 8080,
      address: 'localhost',
    }
    // Load certificates
    if (flags.cert && flags.key) {
      try {
        serverOptions.cert = fs.readFileSync(flags.cert, 'utf8')
        serverOptions.key = fs.readFileSync(flags.key, 'utf8')
      } catch (error) {
        this.logAndExit('Error loading the certificates', error)
      }
    }
    // Create and configure the server
    const app = express()

    // Create the application
    const authManager = new AuthManagerClass(
      new AuthRepositoryFs(flags.files, this.logger)
    )
    const fileStore = new FileStorageClass({
      path: flags.files,
    })
    const expressServer = new ExpressServer(authManager, fileStore, app)
    expressServer.addRoutes()

    // Run the server
    const [domain, port = 8080] = flags.address.split(':')
    serverOptions.port = Number(port)
    serverOptions.address = domain === '' ? 'localhost' : domain

    const server = serverOptions.key ?
      https.createServer(serverOptions, app) :
      app

    server.listen(serverOptions.port, serverOptions.address, () => {
      this.log(
        `Listen on ${serverOptions.port} in port ${serverOptions.address}`
      )
    })
  }
}
