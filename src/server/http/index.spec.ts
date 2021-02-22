import chai, {expect} from 'chai'
import chaiHttp from 'chai-http'
import {createLogger} from '../../logger'
import {FileStorageClass} from '../../repository/file-repository'
import {AuthRepositoryFs} from '../../repository/auth-repository-on-file'
import AuthManagerClass from '../../application/auth-manager'
import {ExpressServer} from '.'
import fs from 'fs'
import {Readable} from 'stream'

chai.use(chaiHttp)

const resetDbAndFiles = (path: string) => {
  fs.rmdirSync(path, {recursive: true})
}

describe('Http server', () => {
  const testFolder = 'testDataServer'
  const logger = createLogger(false)
  const fileStore = new FileStorageClass({path: testFolder})
  const authRepo = new AuthRepositoryFs(testFolder, logger)
  const authManager = new AuthManagerClass(authRepo)

  const testUser = {username: 'testUser', password: 'testPassword1'}

  const rest = new ExpressServer(authManager, fileStore)
  const app = rest.getApp()

  before(async () => {
    await authManager.add(testUser)
  })

  after(() => {
    resetDbAndFiles(testFolder)
  })

  it('Validate user credentials', async () => {
    chai
    .request(app)
    .head('/test')
    .auth(testUser.username, testUser.password)
    .end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.status(200)
      expect(res).to.have.header('content-length', '0')
    })
  })

  it('Return error if credentials are invalid', async () => {
    chai
    .request(app)
    .head('/test')
    .auth('thisusernotexist', 'somesecurepassword1')
    .end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.status(401)
    })
  })

  it('Return the size in the file exist', async () => {
    // Save some data
    const sample = 'some content'
    const partialFileContent = Readable.from([sample])
    const filename = 'somecontante.txt'
    await fileStore.appendFile(
      {
        username: testUser.username,
      },
      filename,
      partialFileContent
    )

    // Request the current file size
    chai
    .request(app)
    .head(`/${filename}`)
    .auth(testUser.username, testUser.password)
    .end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.header('content-length', sample.length.toString())
    })
  })

  it('Return size=0 if the file not exist', async () => {
    chai
    .request(app)
    .head('/somefile.jpg')
    .auth(testUser.username, testUser.password)
    .end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.header('content-length', '0')
    })
  })

  it('Close the open file', async () => {
    // Save some data
    const sample = 'some content'
    const partialFileContent = Readable.from([sample])
    const filename = 'somecontante.txt'
    await fileStore.appendFile(
      {
        username: testUser.username,
      },
      filename,
      partialFileContent
    )

    // Close the open file
    chai
    .request(app)
    .post(`/${filename}`)
    .auth(testUser.username, testUser.password)
    .end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.status(200)
    })
  })

  it('Do not close already closed files', async () => {
    // Save some data and close the file
    const sample = 'some content'
    const partialFileContent = Readable.from([sample])
    const filename = 'somecontante.txt'
    await fileStore.appendFile(
      {
        username: testUser.username,
      },
      filename,
      partialFileContent
    )
    await fileStore.closeFile({username: testUser.username}, filename)

    // Close the open file
    chai
    .request(app)
    .post(`/${filename}`)
    .auth(testUser.username, testUser.password)
    .end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.status(500)
    })
  })
})
