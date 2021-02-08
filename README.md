direct-upload-ts
================

Direct Upload service and command line

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/direct-upload-ts.svg)](https://npmjs.org/package/direct-upload-ts)
[![CircleCI](https://circleci.com/gh/horizontal-org/direct-upload-ts/tree/master.svg?style=shield)](https://circleci.com/gh/horizontal-org/direct-upload-ts/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/direct-upload-ts.svg)](https://npmjs.org/package/direct-upload-ts)
[![License](https://img.shields.io/npm/l/direct-upload-ts.svg)](https://github.com/horizontal-org/direct-upload-ts/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g direct-upload-ts
$ direct-upload-ts COMMAND
running command...
$ direct-upload-ts (-v|--version|version)
direct-upload-ts/0.0.1 linux-x64 node-v14.15.4
$ direct-upload-ts --help [COMMAND]
USAGE
  $ direct-upload-ts COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`direct-upload-ts hello [FILE]`](#direct-upload-ts-hello-file)
* [`direct-upload-ts help [COMMAND]`](#direct-upload-ts-help-command)

## `direct-upload-ts hello [FILE]`

describe the command here

```
USAGE
  $ direct-upload-ts hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ direct-upload-ts hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/horizontal-org/direct-upload-ts/blob/v0.0.1/src/commands/hello.ts)_

## `direct-upload-ts help [COMMAND]`

display help for direct-upload-ts

```
USAGE
  $ direct-upload-ts help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_
<!-- commandsstop -->
