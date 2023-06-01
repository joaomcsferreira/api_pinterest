import express from "express"
import swaggerUi from "swagger-ui-express"
import swaggerDocs from "../documentation/swagger.json"

const documentationRouter = express()

documentationRouter.use("/", swaggerUi.serve)
documentationRouter.get("/", swaggerUi.setup(swaggerDocs))

export default documentationRouter
