import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // QUAN TRỌNG: Dev vẫn dùng synchronize, Production dùng migrations
  synchronize: process.env.NODE_ENV !== 'production',
  // Tự động chạy migrations khi start app (production)
  migrationsRun: process.env.NODE_ENV === 'production',
  logging: process.env.NODE_ENV !== 'production',
}));
