# 🚀 TypeORM Migrations - Hướng Dẫn Sử Dụng

---

## 🧱 **CẤU TRÚC CHUẨN CỦA 1 MIGRATION**

Migration luôn có 2 phần:

| Phần     | Ý nghĩa                         |
| -------- | ------------------------------- |
| `up()`   | Áp dụng thay đổi (apply change) |
| `down()` | Hoàn tác (rollback)             |

### **Template Chuẩn**

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenMigration1234567890 implements MigrationInterface {
  name = 'TenMigration1234567890';

  // ✅ Áp dụng thay đổi
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- SQL thay đổi ở đây
    `);
  }

  // ✅ Hoàn tác thay đổi (ngược lại với up)
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- SQL rollback ở đây
    `);
  }
}
```

### **Ví Dụ: Thêm Cột**

```typescript
export class AddAvatarToUsers1735658500000 implements MigrationInterface {
  // up: Thêm cột
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD "avatar" varchar(255)
    `);
  }

  // down: Xóa cột (ngược lại)
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "avatar"
    `);
  }
}
```

### **Ví Dụ: Tạo Bảng**

```typescript
export class CreatePostsTable1735658600000 implements MigrationInterface {
  // up: Tạo bảng
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'content', type: 'text' },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  // down: Xóa bảng (ngược lại)
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posts');
  }
}
```

> ⚠️ **QUAN TRỌNG**: Luôn viết `down()` đầy đủ để có thể rollback khi cần!

---

## 📋 **CÁC LỆNH MIGRATION**

### 1️⃣ **Xem danh sách migrations**

```bash
npm run migration:show
```

Hiển thị migrations đã chạy và chưa chạy.

### 2️⃣ **Generate migration tự động** (từ entities)

```bash
npm run migration:generate src/migrations/TenMigration
```

**Ví dụ:**

```bash
npm run migration:generate src/migrations/AddAvatarToUsers
```

TypeORM sẽ tự động so sánh entities với DB và tạo migration.

### 3️⃣ **Tạo migration thủ công** (empty template)

```bash
npm run migration:create src/migrations/TenMigration
```

**Ví dụ:**

```bash
npm run migration:create src/migrations/SeedInitialData
```

Tạo file migration trống để bạn tự viết.

### 4️⃣ **Chạy migrations**

```bash
npm run migration:run
```

Chạy tất cả migrations chưa được thực thi.

### 5️⃣ **Rollback migration cuối cùng**

```bash
npm run migration:revert
```

Revert migration gần nhất.

---

## 🔧 **WORKFLOW THỰC TẾ**

### **Scenario 1: Thêm cột mới vào bảng**

**1. Sửa entity:**

```typescript
// src/modules/users/entities/user.entity.ts
@Entity('users')
export class User extends BaseEntity {
  // ... các cột cũ

  @Column({ nullable: true })
  avatar?: string; // ← Thêm cột mới
}
```

**2. Generate migration:**

```bash
npm run migration:generate src/migrations/AddAvatarToUsers
```

**3. Review file migration được tạo:**

```typescript
// src/migrations/1735658500000-AddAvatarToUsers.ts
export class AddAvatarToUsers1735658500000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD "avatar" varchar
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "avatar"
    `);
  }
}
```

**4. Chạy migration:**

```bash
npm run migration:run
```

---

### **Scenario 2: Tạo migration seed data**

**1. Tạo migration thủ công:**

```bash
npm run migration:create src/migrations/SeedAdminUser
```

**2. Viết logic seed:**

```typescript
// src/migrations/1735658600000-SeedAdminUser.ts
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedAdminUser1735658600000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryRunner.query(`
      INSERT INTO "users" 
      ("id", "email", "full_name", "password_hash", "is_active", "is_locked") 
      VALUES 
      (uuid_generate_v4(), 'admin@example.com', 'Admin User', '${hashedPassword}', true, false)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "users" WHERE email = 'admin@example.com'
    `);
  }
}
```

**3. Chạy migration:**

```bash
npm run migration:run
```

---

## 🏭 **PRODUCTION DEPLOYMENT**

### **Docker Compose**

```yaml
# docker-compose.yml
services:
  api:
    build: .
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=secret
      - DB_DATABASE=bcool_construction
    depends_on:
      - postgres
    # Migration sẽ tự chạy khi app start (config: migrationsRun: true)
```

### **CI/CD Pipeline** (Optional - chạy migration riêng)

```yaml
# .github/workflows/deploy.yml
- name: Run Migrations
  run: npm run migration:run
  env:
    NODE_ENV: production
    DB_HOST: ${{ secrets.DB_HOST }}
    DB_USERNAME: ${{ secrets.DB_USERNAME }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

---

## ✅ **BEST PRACTICES**

1. **LUÔN review migration** trước khi commit
2. **Test migration rollback** trước khi deploy production
3. **Backup database** trước khi chạy migration production
4. **Đặt tên migration rõ ràng**: `AddEmailIndexToUsers` ✅, `Update1` ❌
5. **1 migration = 1 việc**: không gộp quá nhiều thay đổi vào 1 migration
6. **Viết down() đầy đủ**: để có thể rollback khi cần

---

## 🐛 **TROUBLESHOOTING**

### **Lỗi: Migration đã chạy nhưng muốn chạy lại**

```sql
-- Xóa record trong bảng migrations
DELETE FROM migrations WHERE name = 'TenMigration1234567890';
```

### **Lỗi: Entity và DB không sync**

```bash
# Generate migration để sync
npm run migration:generate src/migrations/SyncSchema
npm run migration:run
```

### **Lỗi: TypeORM không tìm thấy entities**

Đảm bảo `src/data-source.ts` có đúng đường dẫn:

```typescript
entities: ['src/**/*.entity.ts'], // ✅
entities: ['dist/**/*.entity.js'], // ❌ (sai)
```

---

## 📝 **TÓM TẮT**

| Lệnh                                            | Mục đích                 |
| ----------------------------------------------- | ------------------------ |
| `npm run migration:show`                        | Xem danh sách migrations |
| `npm run migration:generate src/migrations/Ten` | Tạo migration tự động    |
| `npm run migration:create src/migrations/Ten`   | Tạo migration thủ công   |
| `npm run migration:run`                         | Chạy migrations          |
| `npm run migration:revert`                      | Rollback migration cuối  |

**Cấu hình quan trọng:**

- ✅ **Dev**: `synchronize: true` (tự động sync)
- ✅ **Prod**: `synchronize: false` + `migrationsRun: true` (dùng migrations)
