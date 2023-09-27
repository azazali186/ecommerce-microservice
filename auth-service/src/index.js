import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import expressListRoutes from 'express-list-routes';

import User from './models/user.mjs';
import Role from './models/roles.mjs';
import Permission from './models/permissions.mjs';
import { rabbitMQListener } from './rabbitMq/index.mjs'

import { Eureka } from 'eureka-js-client'
import eurekaConfig from './config/eureka.js'

const app = express();

import { inserData } from './utils/index.mjs';


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register with Eureka
const eurekaClient = new Eureka(eurekaConfig);

eurekaClient.start(error => {
  console.log(error || 'Eureka registration complete');
});

import sequelize from "./config/sequelize.mjs"
sequelize.sync();

User.belongsTo(Role, { foreignKey: 'roleId' });

Role.hasMany(User, { foreignKey: 'roleId' });

Role.belongsToMany(Permission, { through: 'rolePermissions' });

Permission.belongsToMany(Role, { through: 'rolePermissions' });

import usersRoutes from "./routes/users/index.mjs";
import authRoutes from "./routes/auth/index.mjs";

import roleRoutes from "./routes/roles/index.mjs"
import permissionRoutes from "./routes/permissions/index.mjs"

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

app.use("/api/auth-service/users", usersRoutes);
app.use("/api/auth-service/auth", authRoutes);
app.use("/api/auth-service/roles", roleRoutes);
app.use("/api/auth-service/permissions", permissionRoutes);
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
