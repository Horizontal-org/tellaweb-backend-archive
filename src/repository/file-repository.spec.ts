import {FileStorageClass} from './file-repository'
import mockFs from 'mock-fs'
import {expect} from 'chai'
import fs from 'fs'
import path from 'path'

describe('File Storage tests', () => {
  const dataFolder = 'data'
  const newFileName = 'to.beuploaded.txt'
  const testUser = 'testUser'
  const testFileName = 'small-file.txt'

  const fileSystem = {
    [newFileName]: 'Other content',
    [dataFolder]: {
      [testUser]: {
        [`${testFileName}.part`]: 'Some content',
      },
    },
  }

  beforeEach(() => {
    mockFs(fileSystem)
  })

  afterEach(() => {
    mockFs.restore()
  })

  const fileStorage = new FileStorageClass({path: dataFolder})

  it('Should return cero as size file if not exist', async () => {
    const [file, error] = await fileStorage.getFileInfo(
      {username: testUser},
      'newfile.jpg'
    )

    expect(error).to.be.null
    expect(file?.size).to.be.equal(0)
  })

  it('Should return the current size if the file exist', async () => {
    const [file, error] = await fileStorage.getFileInfo(
      {username: testUser},
      testFileName
    )

    expect(error).to.be.null
    expect(file?.size).to.be.equal(12) // 12 is "some content" size
  })

  it("Should add the stream input to the user's folder", async () => {
    const [appended, error] = await fileStorage.appendFile(
      {username: testUser},
      newFileName,
      fs.createReadStream(newFileName, 'utf8')
    )

    expect(appended).to.be.true
    expect(error).to.be.null

    expect(fs.existsSync(path.join('data', testUser, `${newFileName}.part`))).to
    .be.true
  })

  it('Should append to the .part file if exist and is open', async () => {
    // Previous status: size = 12
    const [prevFile] = await fileStorage.getFileInfo(
      {username: testUser},
      testFileName
    )
    expect(prevFile!.size).to.be.equal(12)

    const [added] = await fileStorage.appendFile(
      {username: testUser},
      testFileName,
      fs.createReadStream(newFileName, 'utf8')
    )

    expect(added).to.be.true

    const [actualFile] = await fileStorage.getFileInfo(
      {username: testUser},
      testFileName
    )

    expect(actualFile!.size).to.be.equal(25) // "Some ContentOther content" = 25
  })

  it('Should close the file', async () => {
    const [closed] = await fileStorage.closeFile(
      {username: testUser},
      testFileName
    )

    expect(closed).to.be.true

    const [localFile] = await fileStorage.getLocalFile(
      {username: testUser},
      testFileName
    )

    expect(localFile!.exist).to.be.true
    expect(localFile!.closed).to.be.true
  })

  it('Should prevent to append a closed file', async () => {
    // Close open file
    await fileStorage.closeFile({username: testUser}, testFileName)

    // Try to close again
    const [closed, error] = await fileStorage.closeFile(
      {username: testUser},
      testFileName
    )

    expect(closed).to.be.null
    expect(error).to.not.be.null
  })
})
