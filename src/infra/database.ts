import mongoose from "mongoose"

export default class Database {
  private DB_URL = "mongodb://localhost:27017/db_pinterest"

  createConnection() {
    mongoose.connect(this.DB_URL)
  }
}
