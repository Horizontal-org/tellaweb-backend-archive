import {FileStorageClass} from './file-repository'
import mockFs from 'mock-fs'
import fs from 'fs'
import path from 'path'

describe('File Storage tests', () => {
  const dataFolder = 'data'
  const newFileName = 'tobeuploaded.txt'
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
    jest.clearAllMocks()
  })

  afterAll(() => {
    mockFs.restore()
  })

  const fileStorage = new FileStorageClass({path: dataFolder})

  it('Should return cero as size file if not exist', async done => {
    const [file, error] = await fileStorage.getFileInfo(
      {username: testUser},
      'newfile.jpg'
    )

    expect(error).toBeNull()
    expect(file?.size).toBe(0)

    done()
  })

  it('Should return the current size if the file exist', async done => {
    const [file, error] = await fileStorage.getFileInfo(
      {username: testUser},
      testFileName
    )

    expect(error).toBeNull()
    expect(file?.size).toBe(12) // 12 is "some content" size

    done()
  })

  it("Should add the stream input to the user's folder", async done => {
    const [appended, error] = await fileStorage.appendFile(
      {username: testUser},
      newFileName,
      fs.createReadStream(newFileName, 'utf8')
    )

    expect(appended).toBeTruthy()
    expect(error).toBeFalsy()

    expect(
      fs.existsSync(path.join('data', testUser, `${newFileName}.part`))
    ).toBeTruthy()

    done()
  })

  it('Should append to the .part file if exist and is open', async done => {
    // Previous status: size = 12
    const [prevFile] = await fileStorage.getFileInfo(
      {username: testUser},
      testFileName
    )
    expect(prevFile!.size).toBe(12)

    const [added] = await fileStorage.appendFile(
      {username: testUser},
      testFileName,
      fs.createReadStream(newFileName, 'utf8')
    )

    expect(added).toBeTruthy()

    const [actualFile] = await fileStorage.getFileInfo(
      {username: testUser},
      testFileName
    )

    expect(actualFile!.size).toBe(25) // "Some ContentOther content" = 25
    done()
  })

  it('Should close the file', async done => {
    const [closed] = await fileStorage.closeFile(
      {username: testUser},
      testFileName
    )

    expect(closed).toBeTruthy()

    const [localFile] = await fileStorage.getLocalFile(
      {username: testUser},
      testFileName
    )

    expect(localFile!.exist).toBeTruthy()
    expect(localFile!.closed).toBeTruthy()

    done()
  })

  it('Should prevent to append a closed file', async done => {
    // Close open file
    await fileStorage.closeFile({username: testUser}, testFileName)

    // Try to close again
    const [closed, error] = await fileStorage.closeFile(
      {username: testUser},
      testFileName
    )

    expect(closed).toBeFalsy()
    expect(error).toBeTruthy()
    done()
  })
})
