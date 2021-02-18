import bcrypt from 'bcryptjs'
import {UserAndPassword} from '../types/user'

const usernameRegexpt = /^\w[a-zA-Z0-9@_.\\-]*$/

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
