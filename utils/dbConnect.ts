import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// For Next.js, we need to explicitly import the pg module
// and pass it to Sequelize to avoid the "Please install pg package manually" error
let sequelizeConfig: any = {};

if (typeof window === 'undefined') {
  // Only run on server-side
  try {
    const pg = require('pg');
    sequelizeConfig = {
      dialect: 'postgres',
      dialectModule: pg,
      logging: false,
    };
  } catch (error) {
    console.error('Error importing pg module:', error);
  }
}

const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'your_database_name',
  process.env.POSTGRES_USER || 'your_username',
  process.env.POSTGRES_PASSWORD || 'your_password',
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    ...sequelizeConfig,
  }
);

// Ensure database is initialized
let isInitialized = false;
const dbConnect = async () => {
  if (isInitialized || typeof window !== 'undefined') {
    return;
  }

  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    // Sync models with the database with force: true to recreate tables
    // This will drop and recreate tables, which solves the column issues
    // In production, you should use migrations instead
    await sequelize.sync();
    console.log('Database synchronized successfully.');
    isInitialized = true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export { sequelize as db, dbConnect };