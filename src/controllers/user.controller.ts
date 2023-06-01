import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"

import { UserService } from "../services/user.service"
import {
  createToken,
  decodedToken,
  decryptPassword,
  encryptPassword,
} from "../helper/encryption"

import { cannotBlank } from "../helper/validationFields"

interface validationFieldsProps {
  type: "email" | "password" | "username"
  payload: string
}

@injectable()
export class UserController {
  constructor(@inject("IUserService") private _service: UserService) {}

  async getProfile(req: Request, res: Response) {
    try {
      const { username } = req.params

      const result = await this._service.getProfile(username)

      if (!result)
        throw {
          code: 404,
          message: "The User you tried to access doesn't exist.",
        }

      res.status(202).json({ ...this._service.userDisplay(result) })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async getToken(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email) throw { code: 400, message: cannotBlank("email") }
      if (!password) throw { code: 400, message: cannotBlank("password") }

      const user = await this._service.userExist({
        type: "email",
        payload: { email: email.toLocaleLowerCase() },
      })

      if (!user)
        throw {
          code: 404,
          message: "The User you tried to access doesn't exist.",
        }

      const passwordIsValid = await decryptPassword(password, user.password)

      if (!passwordIsValid)
        throw {
          code: 400,
          message:
            "The password you entered is incorrect. Please try again or reset your password if needed.",
        }

      const token = createToken(email, user.username, user._id)

      res.status(201).json({ token })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email) throw { code: 400, message: cannotBlank("email") }
      if (!password) throw { code: 400, message: cannotBlank("password") }

      const emailIsValid = await this.validationFields({
        type: "email",
        payload: email,
      })

      const passwordIsValid = await this.validationFields({
        type: "password",
        payload: password,
      })

      if (emailIsValid) throw { code: 400, message: emailIsValid }
      if (passwordIsValid) throw { code: 400, message: passwordIsValid }

      const emailExist = await this._service.userExist({
        type: "email",
        payload: { email },
      })

      if (emailExist)
        throw {
          code: 409,
          message:
            "The email address you entered is already associated with an account.",
        }

      let username = email.split("@")[0].toLocaleLowerCase()

      const usernameExist = await this._service.userExist({
        type: "username",
        payload: { username },
      })

      if (!emailExist && usernameExist) {
        const randomId = Math.floor(Math.random() * 10 ** 10)
        username = `user${randomId}`
      }

      const passwordEncrypt = await encryptPassword(password)

      const result = await this._service.createUser(
        email,
        username,
        passwordEncrypt
      )

      res.status(201).json({ ...this._service.userDisplay(result) })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { email, username, firstName, lastName } = req.body
      const file = req?.file

      const emailIsValid = await this.validationFields({
        type: "email",
        payload: email,
      })

      const usernameIsValid = await this.validationFields({
        type: "username",
        payload: username,
      })

      if (emailIsValid && email) throw { code: 400, message: emailIsValid }
      if (usernameIsValid && username)
        throw { code: 400, message: usernameIsValid }

      const token = req.headers.authorization!

      const id = decodedToken(token)

      const current_user = await this._service.userExist({
        type: "id",
        payload: { id },
      })

      if (!current_user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      const usernameExist = await this._service.userExist({
        type: "username",
        payload: { username },
      })
      const emailExist = await this._service.userExist({
        type: "email",
        payload: { email },
      })

      if (emailExist && emailExist.email !== current_user?.email)
        throw {
          code: 409,
          message:
            "The email address you entered is already associated with an account.",
        }

      if (usernameExist && usernameExist.username !== current_user?.username)
        throw {
          code: 409,
          message:
            "The username you entered is already associated with an account.",
        }

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
        avatar: current_user?.avatar || "",
      }

      const result = await this._service.updateUser(id, user, file)

      res.status(202).json({ ...this._service.userDisplay(result) })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const token = req.headers.authorization!

      const user = await this._service.getUser(token)

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      const result = await this._service.deleteUser(user!.id)

      res.status(200).json({ result })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
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

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      res.status(200).json({ ...this._service.userDisplay(user) })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async followUser(req: Request, res: Response) {
    try {
      const { usernameToFollow } = req.body
      const token = req.headers.authorization!

      const userToFollow = await this._service.userExist({
        type: "username",
        payload: { username: usernameToFollow },
      })

      if (!userToFollow)
        throw {
          code: 404,
          message: `The user ${usernameToFollow} that you tried to access doesn't exist.`,
        }

      const user = await this._service.getUser(token)

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      if (userToFollow.username === user!.username)
        throw { code: 400, message: "User cannot follow themselves." }

      if (
        user!.following.filter(
          (followingUser) => followingUser.username === userToFollow.username
        ).length > 0
      )
        throw { code: 400, message: "User is already following this account." }

      const result = await this._service.followUser(userToFollow._id, user!._id)

      res.status(200).json({ ...this._service.userDisplay(result) })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async unfollowUser(req: Request, res: Response) {
    try {
      const { usernameToUnfollow } = req.body
      const token = req.headers.authorization!

      const userToUnfollow = await this._service.userExist({
        type: "username",
        payload: { username: usernameToUnfollow },
      })

      if (!userToUnfollow)
        throw {
          code: 404,
          message: `The user ${usernameToUnfollow} that you tried to access doesn't exist.`,
        }

      const user = await this._service.getUser(token)

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      if (user!.username === usernameToUnfollow)
        throw { code: 400, message: "User cannot unfollow themselves." }

      if (
        user!.following.filter(
          (followingUser) => followingUser.username === userToUnfollow.username
        ).length === 0
      )
        throw {
          code: 400,
          message: "User cannot unfollow an account they were not following.",
        }

      const result = await this._service.unfollowUser(
        userToUnfollow._id,
        user!._id
      )

      res.status(200).json({ ...this._service.userDisplay(result) })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
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
