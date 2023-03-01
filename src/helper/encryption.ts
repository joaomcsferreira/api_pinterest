import jwt, { JwtPayload } from "jsonwebtoken"
import { ObjectId } from "mongoose"

import bcrypt from "bcrypt"
import dotenv from "dotenv"

dotenv.config()

const SECRET = process.env.SECRET_KEY as string

const createToken = (
  email: string,
  username: string,
  _id: ObjectId
): string => {
  const token = jwt.sign(
    {
      userId: _id,
      email: email.toLocaleLowerCase(),
      username,
    },
    SECRET,
    {
      expiresIn: "24h",
    }
  )

  return token
}

const decodedToken = (token: string): ObjectId => {
  const decoded = jwt.verify(token, SECRET)

  return (decoded as JwtPayload).userId
}

const encryptPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

const decryptPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashedPassword)
  return isMatch
}

export { createToken, decodedToken, encryptPassword, decryptPassword }
