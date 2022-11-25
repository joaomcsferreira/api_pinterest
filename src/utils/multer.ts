import multer from "multer"
import crypto from "crypto"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/users")
  },
  filename: (req, file, cb) => {
    const type = file.originalname.split(".")[1]

    const name = crypto.randomBytes(64).toString("hex")

    cb(null, `${name}.${type}`)
  },
})

const uploadAvatar = multer({ storage }).single("avatar")

export { uploadAvatar }
