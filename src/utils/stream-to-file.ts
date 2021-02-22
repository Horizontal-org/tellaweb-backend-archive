import fs from 'fs'
import {BaseResponse} from '../types/application'
import {Stream} from 'stream'

export const streamToFile = (
  inputStream: Stream,
  filePath: string
): BaseResponse<boolean> => {
  return new Promise(res => {
    inputStream
    .pipe(fs.createWriteStream(filePath, {flags: 'a', mode: 0o644}))
    .on('finish', () => res([true, null]))
    .on('error', (error: Error) => res([null, error]))
  })
}
