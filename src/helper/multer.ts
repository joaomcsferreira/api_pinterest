import multer, { StorageEngine } from "multer"
import crypto from "crypto"

const storage = (name: String): StorageEngine =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `./uploads/${name}`)
    },
    filename: (req, file, cb) => {
      const type = file.originalname.split(".")[1]

      const name = crypto.randomBytes(64).toString("hex")

      cb(null, `${name}.${type}`)
    },
  })

const uploadPin = multer({ storage: storage("pins") }).single("src")
const uploadAvatar = multer({ storage: storage("users") }).single("avatar")

export { uploadAvatar, uploadPin }
