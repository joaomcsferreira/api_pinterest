import mongoose from "mongoose"

export default class Database {
  private MONGODB_URL = process.env.MONGODB_URL as string

  createConnection() {
    mongoose.set("strictQuery", false)
    mongoose.connect(this.MONGODB_URL)
  }
}
