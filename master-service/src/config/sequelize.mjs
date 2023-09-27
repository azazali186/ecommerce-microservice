import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || "postgres://janny:Aj189628@@192.168.30.28:5556/master-service", {
  dialect: 'postgres' // or 'mysql', 'sqlite', 'mssql', etc.
}); // Note: This method of accessing environment variables might vary based on your setup

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

export default sequelize;
