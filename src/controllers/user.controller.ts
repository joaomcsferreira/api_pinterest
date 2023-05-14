import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"

import crypto from "crypto"

import { UserService } from "../services/user.service"
import {
  createToken,
  decodedToken,
  decryptPassword,
  encryptPassword,
} from "../helper/encryption"

import { cannotBlank } from "../helper/validationFields"
import { getStorageOptions } from "../helper/multer"

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
        throw new Error("The User you tried to access does not exist.")

      res.status(202).json({ result: this._service.userDisplay(result) })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async getToken(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email) throw new Error(cannotBlank("email"))
      if (!password) throw new Error(cannotBlank("password"))

      const user = await this._service.userExist({
        type: "email",
        payload: { email: email.toLocaleLowerCase() },
      })

      if (!user) throw new Error("The User you tried to access does not exist.")

      const passwordIsValid = await decryptPassword(password, user.password)

      if (!passwordIsValid)
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

      const emailExist = await this._service.userExist({
        type: "email",
        payload: { email },
      })

      if (emailExist)
        throw new Error(
          "The email address you entered is already associated with an account."
        )

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

      res.status(201).json({ result: this._service.userDisplay(result) })
    } catch (error: any) {
      res.status(406).json({ error: error.message || error.toString() })
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
        avatar: current_user?.avatar,
      }

      const result = await this._service.updateUser(id, user, file)

      if (!result)
        throw new Error("The User you tried to access doesn't exist.")

      res.status(202).json({ result: this._service.userDisplay(result) })
    } catch (error: any) {
      res.status(406).json({ error: error.message || error.toString() })
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      const token = req.headers.authorization!

      const user = await this._service.userExist({
        type: "id",
        payload: { id },
      })

      if (!user) throw new Error("The User you tried to access does not exist.")

      const currentUser = await this._service.getUser(token)

      if (!currentUser)
        throw new Error("The User you tried to access does not exist.")

      if (user.username != currentUser.username)
        throw new Error("You do not have authorization.")

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

  async followUser(req: Request, res: Response) {
    try {
      const { usernameFollowing } = req.body
      const token = req.headers.authorization!

      const userFollowing = await this._service.userExist({
        type: "username",
        payload: { username: usernameFollowing },
      })

      if (!userFollowing)
        throw new Error(
          `The ${usernameFollowing} you tried to access does not exist.`
        )

      const userFollowed = await this._service.getUser(token)

      if (!userFollowed)
        throw new Error("The userFollowed you tried to access does not exist.")

      if (userFollowing.username === userFollowed.username)
        throw new Error("User cannot follow themselves.")

      if (
        userFollowed.following.filter(
          (followingUser) => followingUser.username === userFollowing.username
        ).length > 0
      )
        throw new Error("User is already following this account.")

      const result = await this._service.followUser(
        userFollowing._id,
        userFollowed._id
      )

      res.status(200).json({ result: this._service.userDisplay(result) })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async unfollowUser(req: Request, res: Response) {
    try {
      const { usernameFollowing } = req.body
      const token = req.headers.authorization!

      const userFollowing = await this._service.userExist({
        type: "username",
        payload: { username: usernameFollowing },
      })

      if (!userFollowing)
        throw new Error("The userFollowing you tried to access does not exist.")

      const userFollowed = await this._service.getUser(token)

      if (!userFollowed)
        throw new Error("The userFollowed you tried to access does not exist.")

      if (
        userFollowed.following.filter(
          (followingUser) => followingUser.username === userFollowing.username
        ).length === 0
      )
        throw new Error(
          "User cannot unfollow an account they were not following."
        )

      const result = await this._service.unfollowUser(
        userFollowing._id,
        userFollowed._id
      )

      res.status(200).json({ result: this._service.userDisplay(result) })
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
