import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import expressListRoutes from 'express-list-routes';

import { zipkinMiddleware } from './config/zipkin.mjs';


const app = express();

app.use(zipkinMiddleware);

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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catelogue-service';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

import ordersRoutes from "./routes/orders/index.mjs"
import cartsRoutes from "./routes/carts/index.mjs"

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

app.use("/api/order-service/orders", ordersRoutes);
app.use("/api/order-service/carts", cartsRoutes);

inserData(expressListRoutes, app);

app.listen(process.env.PORT || 3130, function () {
  console.log(
    "CORS-enabled web server listening on port ",
    process.env.PORT || 3130
  );
});

// Handle exit and deregister from Eureka
process.on('SIGINT', () => {
  eurekaClient.stop(error => {
    console.log(error || 'Deregistered from Eureka');
    process.exit(error ? 1 : 0);
  });
});