import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || "postgres://janny:Aj189628@@192.168.30.28:3155/ecom-auth-service", {
  dialect: 'postgres'
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

export default sequelize;
