import express from 'express'
import {FileStorage} from '../../types/files'
import {AuthManager} from '../../types/user'
import basicAuth from 'basic-auth-connect'

interface HttpServer {
  handleHead: (req: express.Request, res: express.Response) => void;
  handlePut: (req: express.Request, res: express.Response) => void;
  handlePost: (req: express.Request, res: express.Response) => void;
  handleDelete: (req: express.Request, res: express.Response) => void;
  addRoutes: (path: string) => void;
}

const getUsername = (req: express.Request): string => {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const strauth = Buffer.from(b64auth, 'base64').toString()
  const splitIndex = strauth.indexOf(':')
  const user = strauth.substring(0, splitIndex)
  return user
}

const validFileName = (fileName = ''): boolean => {
  const validRegex = /^[a-zA-Z0-9_\\-][a-zA-Z0-9_.\\-]*$/
  return validRegex.test(fileName)
}

export class ExpressServer implements HttpServer {
  private authManager: AuthManager;

  private fileStore: FileStorage;

  private app: express.Application;

  constructor(authManager: AuthManager, fileStore: FileStorage) {
    this.authManager = authManager
    this.fileStore = fileStore
    this.app = express()
    this.addRoutes()
  }

  addRoutes() {
    this.app
    .use(basicAuth(this.authenticationCallback.bind(this)))
    .route('/:file')
    .head(this.handleHead.bind(this))
    .put(this.handlePut.bind(this))
    .post(this.handlePost.bind(this))
    .delete(this.handleDelete.bind(this))
  }

  getApp() {
    return this.app
  }

  async handleHead(req: express.Request, res: express.Response) {
    const username = getUsername(req)
    const fileName = req.params.file as string
    if (!validFileName(fileName)) {
      res.statusCode = 400
      res.send()
      return
    }

    const [fileInfo, errorFileInfo] = await this.fileStore.getFileInfo(
      {username},
      fileName
    )

    if (errorFileInfo !== null) res.statusCode = 404
    if (fileInfo !== null) res.setHeader('content-length', fileInfo.size || 0)

    res.send()
  }

  async authenticationCallback(
    username: string,
    password: string,
    cb: (error?: boolean, user?: string) => void
  ) {
    try {
      const [isValid] = await this.authManager.checkPassword({
        username,
        password,
      })
      cb(isValid !== true, username)
    } catch (error) {
      cb(true, undefined)
    }
  }

  async handleDelete(_: express.Request, res: express.Response) {
    // do nothing
    res.send()
  }

  async handlePost(req: express.Request, res: express.Response) {
    const username = getUsername(req)
    const fileName = req.params.file

    const [, error] = await this.fileStore.closeFile({username}, fileName)

    if (error !== null) res.statusCode = 500

    res.send()
  }

  async handlePut(req: express.Request, res: express.Response) {
    const username = getUsername(req)
    const fileName = req.params.file
    if (fileName.startsWith('.')) {
      res.statusCode = 500
      res.send()
      return
    }

    const [saved, error] = await this.fileStore.appendFile(
      {username},
      fileName,
      req
    )
    if (error || saved === false) res.statusCode = 500
    res.send()
  }
}
