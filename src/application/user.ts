const usernameRegexpt = /^\w[a-zA-Z0-9@_.\\-]*$/

export const validUsername = (username: string): boolean =>
  usernameRegexpt.test(username)
