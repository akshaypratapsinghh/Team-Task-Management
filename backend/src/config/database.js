const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'sqlite:database.sqlite';
const isSqlite = databaseUrl.startsWith('sqlite');

const sequelize = new Sequelize(databaseUrl, {
  dialect: isSqlite ? 'sqlite' : 'postgres',
  logging: false,
  storage: isSqlite ? './database.sqlite' : undefined,
  dialectOptions: isSqlite ? {} : { ssl: { rejectUnauthorized: false } }
});

module.exports = { sequelize };
