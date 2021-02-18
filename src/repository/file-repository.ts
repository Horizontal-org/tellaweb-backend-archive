import {
  FileInfo,
  FileStorage,
  LocalFileStorageConfig,
  LocalFile,
} from '../types/files'
import fs, {ReadStream} from 'fs'
import path from 'path'
import {User} from '../types/user'
import {BaseResponse} from '../types/application'
import {streamToFile} from '../utils/stream-to-file'

export class FileStorageClass implements FileStorage {
  private config: LocalFileStorageConfig;

  private appendableSuffix = '.part';

  constructor(config: LocalFileStorageConfig) {
    this.config = config
  }

  async newLocalFile(path: string, closed: boolean): BaseResponse<LocalFile> {
    try {
      const file: LocalFile = {
        path,
        closed,
      }
      if (fs.existsSync(file.path)) {
        const {size} = fs.statSync(file.path)
        file.exist = true
        file.size = size
      }

      return [file, null]
    } catch (error) {
      return [null, error]
    }
  }

  private getFullDir({username}: User) {
    return path.join(this.config.path, username)
  }

  private getFullPath(user: User, fileName: string) {
    return path.join(this.getFullDir(user), fileName)
  }

  private getPartName(fileName: string) {
    if (fileName.endsWith(this.appendableSuffix)) return fileName
    return fileName + this.appendableSuffix
  }

  async getLocalFile(user: User, fileName: string): BaseResponse<LocalFile> {
    const [closed, errorClosed] = await this.newLocalFile(
      this.getFullPath(user, fileName),
      true
    )

    if (errorClosed !== null) return [null, errorClosed]
    if (closed?.exist === true) return [closed, null]

    // If closed not exist, return current or future .part file
    const [part, errorPart] = await this.newLocalFile(
      this.getFullPath(user, this.getPartName(fileName)),
      false
    )

    if (errorPart !== null) return [null, errorPart]

    return [part!, null]
  }

  private createUserDir(user: User) {
    try {
      const dir = this.getFullDir(user)
      fs.mkdirSync(dir, {mode: 0o755, recursive: true})
    } catch (_) {
      // ignore error
    }
  }

  async appendFile(
    user: User,
    file: string,
    stream: ReadStream
  ): BaseResponse<boolean> {
    const [localFile, errorLocalFile] = await this.getLocalFile(user, file)
    if (errorLocalFile !== null) return [null, errorLocalFile]

    if (localFile!.closed) return [null, new Error('Appending on closed file')]

    this.createUserDir(user)

    return streamToFile(stream, localFile!.path)
  }

  async closeFile(user: User, file: string): BaseResponse<boolean> {
    const [localFile, localFileError] = await this.getLocalFile(user, file)
    if (localFileError !== null) return [null, localFileError]

    if (!localFile!.exist) return [null, new Error('File not found')]
    if (localFile!.closed)
      return [null, new Error('Closing non-existent file')]

    try {
      fs.renameSync(
        localFile!.path,
        localFile!.path.replace(this.appendableSuffix, '')
      )
      return [true, null]
    } catch (error) {
      return [null, error]
    }
  }

  async getFileInfo(user: User, file: string): BaseResponse<FileInfo> {
    try {
      const [localFile, localFileError] = await this.getLocalFile(user, file)
      if (localFileError !== null) return [null, localFileError]

      const fileInfo: FileInfo = {
        size: localFile!.size || 0,
      }
      return [fileInfo, null]
    } catch (error) {
      return [null, error]
    }
  }
}
