import multer from "multer"
import crypto from "crypto"

const uploadPin = multer({ storage: multer.memoryStorage() }).single("file")
const uploadAvatar = multer({ storage: multer.memoryStorage() }).single("file")

const getStorageOptions = (file: Express.Multer.File | undefined) => {
  const nameHex = crypto.randomBytes(64).toString("hex")
  const nameType = file?.mimetype.replace(/\w+\//, "")
  const nameImage = `${nameHex}.${nameType}`

  const metadata = {
    contentType: file?.mimetype,
  }

  const buffer = file?.buffer

  return { nameImage, metadata, buffer }
}

export { uploadAvatar, uploadPin, getStorageOptions }
