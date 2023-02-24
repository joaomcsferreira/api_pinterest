import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
import { ObjectId } from "mongoose"

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

export { createToken, decodedToken }
