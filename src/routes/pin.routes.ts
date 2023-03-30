import "reflect-metadata"
import { container } from "tsyringe"
import express, { Request, Response } from "express"

import { PinController } from "../controllers/pin.controller"
import permission from "../middlewares/user.middleware"

const pinRouter = express()
const pin = container.resolve(PinController)

pinRouter
  .route("/pins")
  .get((req: Request, res: Response) => pin.getPins(req, res))

pinRouter
  .route("/pin/:id")
  .get((req: Request, res: Response) => pin.getPin(req, res))

pinRouter
  .route("/pin")
  .post(permission, (req: Request, res: Response) => pin.createPin(req, res))

pinRouter
  .route("/pin/:id")
  .put(permission, (req: Request, res: Response) => pin.updatePin(req, res))

pinRouter
  .route("/pin/:id")
  .delete(permission, (req: Request, res: Response) => pin.deletePin(req, res))

export default pinRouter
