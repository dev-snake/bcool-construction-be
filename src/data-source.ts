import 'dotenv/config';
import { DataSource } from 'typeorm';

// DataSource dùng cho TypeORM CLI (generate/run migrations)
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'bcool_construction',

  // Đường dẫn entities (cần .ts cho CLI)
  entities: ['src/**/*.entity.ts'],

  // Thư mục chứa migrations
  migrations: ['src/migrations/*.ts'],

  // QUAN TRỌNG: Tắt synchronize khi dùng migrations
  synchronize: false,

  // Bật logging để debug
  logging: true,
});

// QUAN TRỌNG: TypeORM CLI yêu cầu default export
export default AppDataSource;
