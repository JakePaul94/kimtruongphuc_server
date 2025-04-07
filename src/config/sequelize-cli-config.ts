// src/config/sequelize-cli-config.ts
import dotenv from 'dotenv';
dotenv.config(); // Đọc file .env

// Cấu trúc giống config/config.json mà CLI mong đợi
const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql", 
  },
  test: {
  },
  production: {
  }
};

// Export dưới dạng module.exports để file JS sau khi biên dịch có thể đọc được
module.exports = config;