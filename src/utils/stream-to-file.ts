import fs, {ReadStream} from 'fs'
import {BaseResponse} from '../types/application'

export const streamToFile = (
  inputStream: ReadStream,
  filePath: string
): BaseResponse<boolean> => {
  return new Promise(res => {
    inputStream
    .pipe(fs.createWriteStream(filePath, {flags: 'a', mode: 0o644}))
    .on('finish', () => res([true, null]))
    .on('error', error => res([null, error]))
  })
}
