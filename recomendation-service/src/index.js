import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import expressListRoutes from 'express-list-routes';

import User from './models/user.mjs';
import { rabbitMQListener } from './rabbitMq/index.mjs'

import { Eureka } from 'eureka-js-client'
import eurekaConfig from './config/eureka.js'
import sequelize from "./config/sequelize.mjs"
import Product from './models/product.mjs';

const app = express();

import { inserData } from './utils/index.mjs';


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register with Eureka
const eurekaClient = new Eureka(eurekaConfig);

eurekaClient.start(error => {
  console.log(error || 'Eureka registration complete');
});

User.belongsToMany(Product, { through: UserInteraction });
Product.belongsToMany(User, { through: UserInteraction });


sequelize.sync();

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

app.use("/api/recommendation-service/permissions", permissionRoutes);
await inserData(expressListRoutes, app);

rabbitMQListener();


app.listen(process.env.PORT || 5100, function () {
  console.log(
    "CORS-enabled web server listening on port ",
    process.env.PORT || 5100
  );
});

// Handle exit and deregister from Eureka
process.on('SIGINT', () => {
  eurekaClient.stop(error => {
    console.log(error || 'Deregistered from Eureka');
    process.exit(error ? 1 : 0);
  });
});
