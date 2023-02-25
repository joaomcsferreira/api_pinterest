import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"

import { UserService } from "../services/user.service"
import { createToken, decodedToken } from "../utils/jwt"
import { cannotBlank } from "../utils/validationFields"

interface MulterRequest extends Request {
  file: any
}

interface validationFieldsProps {
  type: "email" | "password" | "username"
  payload: string
}

@injectable()
export class UserController {
  constructor(@inject("IUserService") private _service: UserService) {}

  async getUsers(req: Request, res: Response) {
    const result = await this._service.getUsers()

    const users = result.map((user) => this._service.userDisplay(user))

    res.status(202).json({ users })
  }

  async getProfile(req: Request, res: Response) {
    try {
      const { username } = req.params

      const result = await this._service.getProfile(username)

      if (!result)
        throw new Error("The User you tried to access does not exist.")

      const user = this._service.userDisplay(result)

      res.status(202).json({ result })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async getToken(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email) throw new Error(cannotBlank("email"))
      if (!password) throw new Error(cannotBlank("password"))

      const emailExist = await this._service.userExist({
        type: "email",
        payload: { email: email.toLocaleLowerCase() },
      })
      if (!emailExist)
        throw new Error("The User you tried to access does not exist.")

      const user = await this._service.userExist({
        type: "password",
        payload: { email: email.toLocaleLowerCase(), password },
      })

      if (!user)
        throw new Error(
          "The password you entered is incorrect. Please try again or reset your password if needed."
        )

      const token = createToken(email, user.username, user._id)

      res.status(201).json({ result: token })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email) throw new Error(cannotBlank("email"))
      if (!password) throw new Error(cannotBlank("password"))

      const emailIsValid = await this.validationFields({
        type: "email",
        payload: email,
      })

      const passwordIsValid = await this.validationFields({
        type: "password",
        payload: password,
      })

      if (emailIsValid) throw new Error(emailIsValid)
      if (passwordIsValid) throw new Error(passwordIsValid)

      const user = await this._service.userExist({
        type: "email",
        payload: { email },
      })

      if (user)
        throw new Error(
          "The email address you entered is already associated with an account."
        )

      const result = await this._service.createUser(email, password)

      res.status(201).json({ result })
    } catch (error: any) {
      res.status(406).json({ error: error.message || error.toString() })
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { email, username, firstName, lastName } = req.body
      const avatar = (req as MulterRequest).file?.path.replaceAll("\\", "/")

      const emailIsValid = await this.validationFields({
        type: "email",
        payload: email,
      })

      const usernameIsValid = await this.validationFields({
        type: "username",
        payload: username,
      })

      if (emailIsValid && email) throw new Error(emailIsValid)
      if (usernameIsValid && username) throw new Error(usernameIsValid)

      const token = req.headers.authorization!

      const id = decodedToken(token)

      const current_user = await this._service.userExist({
        type: "id",
        payload: { id },
      })

      const usernameExist = await this._service.userExist({
        type: "username",
        payload: { username },
      })
      const emailExist = await this._service.userExist({
        type: "email",
        payload: { email },
      })

      if (emailExist && emailExist.email !== current_user?.email)
        throw new Error(
          "The email address you entered is already associated with an account."
        )

      if (usernameExist && usernameExist.username !== current_user?.username)
        throw new Error(
          "The username you entered is already associated with an account."
        )

      if (!current_user)
        throw new Error("The User you tried to access doesn't exist.")

      const user = {
        _id: id,
        email: email ? email.toLocaleLowerCase() : current_user?.email,
        username: username
          ? username.toLocaleLowerCase()
          : current_user?.username,
        firstName: firstName
          ? firstName.toLocaleLowerCase()
          : current_user?.firstName,
        lastName: lastName
          ? lastName.toLocaleLowerCase()
          : current_user?.lastName,
        avatar: avatar || current_user?.avatar,
      }

      const result = await this._service.updateUser(id, user)

      if (!result)
        throw new Error("The User you tried to access doesn't exist.")

      res.status(202).json({ result })
    } catch (error: any) {
      res.status(406).json({ error: error.message || error.toString() })
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params

      const user = await this._service.userExist({
        type: "id",
        payload: { id },
      })

      if (!user) throw new Error("The User you tried to access does not exist.")

      const result = await this._service.deleteUser(id)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async validateUser(req: Request, res: Response) {
    try {
      const token = req.headers.authorization!

      const id = decodedToken(token)

      const user = await this._service.userExist({
        type: "id",
        payload: { id },
      })

      if (!user) throw new Error("The User you tried to access does not exist.")

      res.status(200).json({ result: this._service.userDisplay(user) })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async validationFields({ type, payload }: validationFieldsProps) {
    const validationRules = {
      email: {
        regex:
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        message:
          "The email address you entered is not in the correct format. Please try again.",
      },
      password: {
        regex: /^.{6,}$/,
        message:
          "The password must be at least 6 characters long. Please choose a stronger password and try again.",
      },
      username: {
        regex: /^[^0-9\W][\w]*$/,
        message:
          "Usernames cannot start with a number or symbol. Please choose a different username and try again.",
      },
    }

    switch (type) {
      case "email":
        return !validationRules.email.regex.test(payload)
          ? validationRules.email.message
          : ""
      case "password":
        return !validationRules.password.regex.test(payload)
          ? validationRules.password.message
          : ""
      case "username":
        return !validationRules.username.regex.test(payload)
          ? validationRules.username.message
          : ""
    }
  }
}
