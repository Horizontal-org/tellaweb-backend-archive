import bcrypt from 'bcryptjs'
import {UserAndPassword} from '../types/user'

// min 6 max 20 characters
// no _ or i at the beginning
// no __ or ._ or _. or .. inside
// no . or _ at the end
// only letters, numbers, . and _ are valid characters
const usernameRegexpt = /^(?=[a-zA-Z0-9._]{6,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/

// Minimum eight characters, at least one letter and one number:
const passwordRegexpt = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/

export const validPassword = (password: string): boolean =>
  passwordRegexpt.test(password)

export const validUsername = (username: string): boolean =>
  usernameRegexpt.test(username)

export const getHash = (password: string): string => {
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt)
  return hash
}

export const validUserAndPassword = ({
  username,
  password,
}: UserAndPassword) => {
  if (!validUsername(username)) return false
  if (!validPassword(password)) return false
  return true
}
