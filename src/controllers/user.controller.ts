import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"
import { UserService } from "../services/user.service"
import { createToken, decodedToken } from "../utils/jwt"

interface MulterRequest extends Request {
  file: any
}

@injectable()
export class UserController {
  constructor(@inject("IUserService") private _service: UserService) {}

  async getProfile(req: Request, res: Response) {
    try {
      const { username } = req.params

      const result = await this._service.getProfile(username)

      if (!result.email) throw new Error("User not found!")

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async getToken(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      const user = await this._service.userExist({ email, password })

      const token = createToken(email, user.username, user._id)

      res.status(201).json({ token })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { email, password, username } = req.body

      const result = await this._service.createUser(email, password, username)

      res.status(201).json({ result })
    } catch (error: any) {
      if (["E11000", "email"].every((value) => error.message.includes(value)))
        error.message = "Email already used"
      else if (
        ["E11000", "username"].every((value) => error.message.includes(value))
      )
        error.message = "Username already used"

      res.status(500).json({ error: error.message })
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { email, password, username, firstName, lastName } = req.body
      const avatar = (req as MulterRequest).file?.path.replaceAll("\\", "/")

      const token = req.headers.authorization!

      const userId = decodedToken(token)

      const current_user = await this._service.userExist({ id: userId })

      const user = {
        _id: userId,
        email: email ? email.toLocaleLowerCase() : current_user.email,
        password: password,
        username: username
          ? username.toLocaleLowerCase()
          : current_user.username,
        firstName: firstName
          ? firstName.toLocaleLowerCase()
          : current_user.firstName,
        lastName: lastName
          ? lastName.toLocaleLowerCase()
          : current_user.lastName,
        avatar: avatar || current_user.avatar,
        updatedAt: new Date(),
      }

      const result = await this._service.updateUser(userId, user)

      res.status(200).json({ result })
    } catch (error: any) {
      if (["E11000", "email"].every((value) => error.message.includes(value)))
        error.message = "Email already used"
      else if (
        ["E11000", "username"].every((value) => error.message.includes(value))
      )
        error.message = "Username already used"
      else error.message = error.toString()

      res.status(500).json({ error: error.message })
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params

      const user = await this._service.userExist({ id })

      if (!user.email) throw new Error("User not found!")

      const result = await this._service.deleteUser(id)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async validateUser(req: Request, res: Response) {
    try {
      const token = req.headers.authorization!

      const userId = decodedToken(token)

      const user = await this._service.userExist({ id: userId })

      res.status(200).json({ user })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }
}
