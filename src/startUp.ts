import express, { Application, NextFunction, Request, Response } from "express"
import multer from "multer"

import "./shared/container"

import Database from "./infra/database"
import userRouter from "./routes/user.routes"

class StartUp {
  public app: Application
  public upload
  private _db: Database = new Database()

  constructor() {
    this.app = express()
    this.upload = multer()
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use("/uploads", express.static("./uploads"))
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header("Access-Control-Allow-Origin", "http://localhost:3000")
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Authorization, Content-Type, Accept"
      )
      res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE")
      next()
    })
    this._db.createConnection()
    this.routes()
  }

  routes() {
    this.app.route("/").get((request: Request, response: Response) => {
      response.send({ version: "0.0.1" })
    })

    this.app.use("/", userRouter)
  }
}

export default new StartUp()
