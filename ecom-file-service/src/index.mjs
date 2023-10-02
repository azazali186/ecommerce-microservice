import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { promises as fs, existsSync } from "fs";
import expressListRoutes from "express-list-routes";
import { verifyTokenAndAuthorization } from "./middleware/verifyToken.mjs";
import mongoose from "mongoose";
import Files from "./models/files.mjs";
import { inserData } from "./utils/index.mjs";
import { Eureka } from "eureka-js-client";
import eurekaConfig from "./config/eureka.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Register with Eureka
const eurekaClient = new Eureka(eurekaConfig);

eurekaClient.start((error) => {
  console.log(error || "Eureka registration complete");
});

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/image-service";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

/* var whitelist = ["http://localhost:8000", "http://localhost:8080"];
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
app.use(cors(corsOptions)); */
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(
  "/uploads",
  verifyTokenAndAuthorization,
  express.static(path.join(__dirname, "uploads"))
);

const allowedMimetypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/mpeg",
  "application/pdf",
];
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DEFAULT_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    if (!req.timestamp) {
      req.timestamp = Date.now().toString();
    }
    const dir = path.join(__dirname, "uploads", req.timestamp);
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadMiddleware = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
}).array("files", 10);

app.post("/api/file-service/upload", verifyTokenAndAuthorization, async (req, res) => {
  try {
    uploadMiddleware(req, res);
    
    // Check file sizes
    for (let file of req.files) {
      if (file.mimetype.startsWith("video/") && file.size > MAX_VIDEO_SIZE) {
        throw new Error("Video files should be no larger than 100MB.");
      } else if (file.size > MAX_DEFAULT_SIZE) {
        throw new Error("Non-video files should be no larger than 10MB.");
      }
    }

    const { type, typeId } = req.body;
    const dirPath = path.join("uploads", req.timestamp);
    const filePaths = req.files.map(
      (file) => `${process.env.SERVER_HOST}:${process.env.PORT}/${dirPath}/${file.filename}`
    );

    const file = await Files.findOne({ where: { type: type, typeId: typeId } });

    if (file) {
      file.path = filePaths;
      await file.save();
    } else {
      await Files.create({
        path: filePaths,
        type: type,
        typeId: typeId
      }).save();
    }

    res.json({ success: true, files: filePaths });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


inserData(expressListRoutes, app);

app.listen(process.env.PORT || 3055, function () {
  console.log(
    "CORS-enabled web server listening on port ",
    process.env.PORT || 3055
  );
});

// Handle exit and deregister from Eureka
process.on("SIGINT", () => {
  eurekaClient.stop((error) => {
    console.log(error || "Deregistered from Eureka");
    process.exit(error ? 1 : 0);
  });
});
