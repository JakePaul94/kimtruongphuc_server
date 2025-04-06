import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import userRoutes from './routes/userRouter';
import { sequelize } from './config/database';
import authRouter from './routes/authRouter';
import { errorMiddleware } from './middlewares/errorMiddleware';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/users', userRoutes);
app.use('/auth', authRouter); // Chỉ là ví dụ, bạn có thể tạo route auth riêng
app.get('/', (req, res) => {
  res.send('Hello World with Express, TypeScript, Sequelize!');
});
app.use(errorMiddleware);
const startServer = async () => {
  try {
    await sequelize.sync({ force: true }); // Đồng bộ DB (dùng `alter: true` để update schema nhẹ)
    console.log('✅ Database synced');
    
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to sync database:', error);
  }
};

startServer();