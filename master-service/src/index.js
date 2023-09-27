import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import expressListRoutes from 'express-list-routes';

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

import sequelize from "./config/sequelize.mjs"
sequelize.sync();

import languagesRoutes from "./routes/languages/index.mjs"
import countriesRoutes from "./routes/countries/index.mjs"
import statesRoutes from "./routes/states/index.mjs"
import currenciesRoutes from "./routes/currencies/index.mjs"
import Country from './models/country.mjs';
import States from './models/states.mjs';

Country.hasMany(States, { foreignKey: 'countryId' });
States.belongsTo(Country, { foreignKey: 'countryId' });

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

app.use("/api/master-service/languages", languagesRoutes);
app.use("/api/master-service/countries", countriesRoutes);
app.use("/api/master-service/states", statesRoutes);
app.use("/api/master-service/currencies", currenciesRoutes);

inserData(expressListRoutes, app);

app.listen(process.env.PORT || 5110, function () {
  console.log(
    "CORS-enabled web server listening on port ",
    process.env.PORT || 5110
  );
});

// Handle exit and deregister from Eureka
process.on('SIGINT', () => {
  eurekaClient.stop(error => {
    console.log(error || 'Deregistered from Eureka');
    process.exit(error ? 1 : 0);
  });
});