import {BaseResponse} from './application'
import {User} from './user'
import {Stream} from 'stream'

export type FileInfo = {
  name?: string;
  size?: number;
};

export type LocalFile = {
  path: string;
  size?: number;
  exist?: boolean;
  closed: boolean;
};

export type LocalFileStorageConfig = {
  path: string;
};

export interface FileStorage {
  getFileInfo: (user: User, file: string) => BaseResponse<FileInfo>;
  appendFile: (
    user: User,
    file: string,
    stream: Stream
  ) => BaseResponse<boolean>;
  closeFile: (user: User, file: string) => BaseResponse<boolean>;
}
