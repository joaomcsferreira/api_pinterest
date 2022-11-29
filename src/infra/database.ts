import mongoose from "mongoose"

export default class Database {
  private DB_URL = process.env.DB_URI as string

  createConnection() {
    mongoose.connect(this.DB_URL)
  }
}
