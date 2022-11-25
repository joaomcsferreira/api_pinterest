import jwt, { Jwt } from "jsonwebtoken"
import { User } from "../models/user.model"

const SECRET = "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpIiwiaWF0IjoxNTE2M"

const createToken = (email: String, username: String, _id: String): String => {
  const token = jwt.sign(
    {
      userId: _id,
      email,
      username,
    },
    SECRET,
    {
      expiresIn: "24h",
    }
  )

  return token
}

const decodedToken = (token: string) => {
  const decoded = jwt.verify(token, SECRET)

  return (decoded as any).userId
}

export { createToken, decodedToken }
