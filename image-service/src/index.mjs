import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { promises as fs, existsSync } from "fs";
import expressListRoutes from 'express-list-routes';
import { verifyTokenAndAuthorization } from "./middleware/verifyToken.mjs";
const app = express();

import { inserData } from './utils/index.mjs';

import { Eureka } from 'eureka-js-client'
import eurekaConfig from './config/eureka.js'

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Register with Eureka
const eurekaClient = new Eureka(eurekaConfig);

eurekaClient.start(error => {
  console.log(error || 'Eureka registration complete');
});


import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/image-service';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

var whitelist = ["http://localhost:8000", "http://localhost:8080"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["*"],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const allowedMimetypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/mpeg",
  "application/pdf",
];

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    if (!req.timestamp) {
      req.timestamp = Date.now().toString();
    }
    const dir = path.join(__dirname, 'uploads', req.timestamp);
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});


const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

app.post("/upload", verifyTokenAndAuthorization , (req, res, next) => {
  upload.array("files", 10)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).send(err.message);
    } else if (err) {
      return res.status(400).send(err.message);
    }

    // Check file sizes
    for (let file of req.files) {
      if (file.mimetype.startsWith("video/")) {
        if (file.size > 100 * 1024 * 1024) {
          // 100MB
          return res
            .status(400)
            .send("Video files should be no larger than 100MB.");
        }
      } else {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB
          return res
            .status(400)
            .send("Non-video files should be no larger than 10MB.");
        }
      }
    }

    const dirPath = path.join("uploads", req.timestamp);
    const filePaths = req.files.map(
      (file) => `http://localhost:${port}/${dirPath}/${file.filename}`
    );
    res.json(filePaths);
  });
});

app.get("/files", async (req, res) => {
  try {
    const directories = await fs.readdir(path.join(__dirname, "uploads"));
    let fileUrls = [];

    for (const dir of directories) {
      const filesInDir = await fs.readdir(path.join(__dirname, "uploads", dir));
      const urlsInDir = filesInDir.map(
        (file) => `http://localhost:${port}/uploads/${dir}/${file}`
      );
      fileUrls = [...fileUrls, ...urlsInDir];
    }
    res.json(fileUrls);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

inserData(expressListRoutes, app);

app.listen(process.env.PORT || 5055, function () {
  console.log(
    "CORS-enabled web server listening on port ",
    process.env.PORT || 5055
  );
});

// Handle exit and deregister from Eureka
process.on('SIGINT', () => {
  eurekaClient.stop(error => {
    console.log(error || 'Deregistered from Eureka');
    process.exit(error ? 1 : 0);
  });
});