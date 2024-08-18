import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import multerS3 from "multer-s3";
import AWS from "@aws-sdk/client-s3";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({ credentials: true, origin: "*" }));

const s3Client = new AWS.S3({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME || "",
    acl: "public-read",
    // FileName
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
    // for open image or file from URL instead of Download
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(500).json({
      message: "Something went wrong",
    });
  } else {
    res.status(201).json({
      fileName: req.file.originalname,
      fileUrl: req.file.location,
    });
  }
});

app.listen(PORT, () => {
  console.log("this app using port", PORT);
});
