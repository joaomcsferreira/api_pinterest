import jwt from "jsonwebtoken"

const SECRET = process.env.SECRET_KEY as string

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
