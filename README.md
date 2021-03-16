[![Coverage Status](https://coveralls.io/repos/github/Horizontal-org/tellaweb-backend/badge.svg?branch=main)](https://coveralls.io/github/Horizontal-org/tellaweb-backend?branch=main)
# Tella Web (backend)
This package contains the backend for Tella Web and is compatible with direct-upload. It allows to manage the users via command line and to run the server for http access.
The server allows to use HTTPS with configurable domain and ports.


# Usage
<!-- usage -->
```sh-session
$ git clone https://github.com/Horizontal-org/tellaweb-backend.git
$ cd tellaweb-backend
$ npm install
$ ./bin/run COMMAND
running command...
$ ./bin/run (-v|--version|version)
tellaweb-backend/0.0.1 linux-x64 node-v14.15.4
$ ./bin/run --help [COMMAND]
USAGE
  $ ./bin/run COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`tellaweb-backend about`](#tellaweb-backend-about)
* [`tellaweb-backend auth:add`](#tellaweb-backend-authadd)
* [`tellaweb-backend auth:change-password`](#tellaweb-backend-authchange-password)
* [`tellaweb-backend auth:del`](#tellaweb-backend-authdel)
* [`tellaweb-backend auth:list`](#tellaweb-backend-authlist)
* [`tellaweb-backend auth:role`](#tellaweb-backend-authrole)
* [`tellaweb-backend help [COMMAND]`](#tellaweb-backend-help-command)
* [`tellaweb-backend server`](#tellaweb-backend-server)

## `tellaweb-backend about`

About direct-upload and Horizontal

```
USAGE
  $ ./bin/run about
```

_See code: [src/commands/about.ts](https://github.com/horizontal-org/tellaweb-backend/blob/v0.0.1/src/commands/about.ts)_

## `tellaweb-backend auth:add`

Add user authentication if doesn't already exist.

```
USAGE
  $ ./bin/run auth:add

OPTIONS
  -d, --db=db              [default: db]
  -f, --files=files        [default: data]
  -l, --verbose
  -u, --username=username  (required)
```

_See code: [src/commands/auth/add.ts](https://github.com/horizontal-org/tellaweb-backend/blob/v0.0.1/src/commands/auth/add.ts)_

## `tellaweb-backend auth:change-password`

Change user authentication. Will prompt for password

```
USAGE
  $ ./bin/run auth:change-password

OPTIONS
  -d, --db=db              [default: db]
  -f, --files=files        [default: data]
  -l, --verbose
  -u, --username=username  (required)
```

_See code: [src/commands/auth/change-password.ts](https://github.com/horizontal-org/tellaweb-backend/blob/v0.0.1/src/commands/auth/change-password.ts)_

## `tellaweb-backend auth:del`

Delete user authentication

```
USAGE
  $ ./bin/run auth:del

OPTIONS
  -d, --db=db              [default: db]
  -f, --files=files        [default: data]
  -l, --verbose
  -u, --username=username  (required)
```

_See code: [src/commands/auth/del.ts](https://github.com/horizontal-org/tellaweb-backend/blob/v0.0.1/src/commands/auth/del.ts)_

## `tellaweb-backend auth:list`

List usernames

```
USAGE
  $ ./bin/run auth:list

OPTIONS
  -d, --db=db        [default: db]
  -f, --files=files  [default: data]
  -l, --verbose
```

_See code: [src/commands/auth/list.ts](https://github.com/horizontal-org/tellaweb-backend/blob/v0.0.1/src/commands/auth/list.ts)_

## `./bin/run auth:role`

Change user role

```
USAGE
  $ tellaweb-backend auth:role

OPTIONS
  -d, --db=db              [default: db]
  -f, --files=files        [default: data]
  -l, --verbose
  -u, --username=username  (required)
```

_See code: [src/commands/auth/role.ts](https://github.com/horizontal-org/tellaweb-backend/blob/v0.0.1/src/commands/auth/role.ts)_

## `tellaweb-backend help [COMMAND]`

display help for tellaweb-backend

```
USAGE
  $ ./bin/run help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `tellaweb-backend server`

Start Tella Direct Upload Server

```
USAGE
  $ ./bin/run server

OPTIONS
  -a, --address=address    [default: :8080] address for server to bind to
  -c, --cert=cert          certificate file, ie. ./fullcert.pem
  -d, --database=database  [default: ./direct-upload.db] direct-upload database file
  -d, --db=db              [default: db]
  -f, --files=files        [default: ./data] path where direct-upload server stores uploaded files
  -h, --help               show CLI help
  -k, --key=key            private key file, ie: ./key.pem
  -l, --verbose
```

_See code: [src/commands/server.ts](https://github.com/horizontal-org/tellaweb-backend/blob/v0.0.1/src/commands/server.ts)_
<!-- commandsstop -->
