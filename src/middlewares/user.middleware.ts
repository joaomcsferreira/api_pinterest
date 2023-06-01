import jtw from "jsonwebtoken"

import { NextFunction, Request, Response } from "express"

const permission = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization!
  const SECRET = process.env.SECRET_KEY as string

  jtw.verify(token, SECRET, (err) => {
    if (err) {
      return res.status(401).json({ error: "You don't have authorization." })
    }

    return next()
  })
}

export default permission
