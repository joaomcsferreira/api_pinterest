import { Document } from "mongoose"

export abstract class Core extends Document {
  createdAt: Date
  updatedAt: Date
}
