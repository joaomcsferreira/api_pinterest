import "reflect-metadata"
import express, { Request, Response } from "express"
import { container } from "tsyringe"
import { PinController } from "../controllers/pin.controller"
import { uploadPin } from "../utils/multer"

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
  .post(uploadPin, (req: Request, res: Response) => pin.createPin(req, res))

pinRouter
  .route("/pin")
  .put((req: Request, res: Response) => pin.updatePin(req, res))

pinRouter
  .route("/pin/:id")
  .delete((req: Request, res: Response) => pin.deletePin(req, res))

export default pinRouter
