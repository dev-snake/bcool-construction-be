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

  // Đường dẫn entities (hỗ trợ cả .ts cho dev và .js cho build)
  entities: [__dirname + '/**/*.entity{.ts,.js}'],

  // Thư mục chứa migrations
  // Thư mục chứa migrations
  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  // QUAN TRỌNG: Tắt synchronize khi dùng migrations
  synchronize: false,

  // Bật logging để debug
  logging: true,
});

// QUAN TRỌNG: TypeORM CLI yêu cầu default export
export default AppDataSource;
