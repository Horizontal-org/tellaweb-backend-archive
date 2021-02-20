import log from 'loglevel'

export const createLogger = (verbose = false) => {
  if (verbose) log.setLevel(log.levels.DEBUG)
  else log.setLevel(log.levels.INFO)

  return log
}
