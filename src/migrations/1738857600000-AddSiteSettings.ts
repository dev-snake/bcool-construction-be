import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSiteSettings1738857600000 implements MigrationInterface {
  name = 'AddSiteSettings1738857600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "site_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "setting_key" varchar(100) NOT NULL,
        "setting_value" text,
        "setting_group" varchar(50) NOT NULL DEFAULT 'general',
        "label" varchar(255),
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "UQ_site_settings_key" UNIQUE ("setting_key"),
        CONSTRAINT "PK_site_settings" PRIMARY KEY ("id")
      )
    `);

    // Seed default settings
    await queryRunner.query(`
      INSERT INTO "site_settings" ("setting_key", "setting_value", "setting_group", "label", "description") VALUES
      ('company_description', 'Công ty TNHH Tập Đoàn Xây Dựng BCOOL được thành lập năm 1993. Là đơn vị hàng đầu trong ngành xây dựng Việt Nam.', 'general', 'Mô tả công ty', 'Mô tả ngắn về công ty hiển thị ở footer'),
      ('slogan', 'Xây dựng bằng lương tâm và tri thức', 'general', 'Slogan', 'Khẩu hiệu công ty hiển thị ở footer'),
      ('footer_banner_image', 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=2000&auto=format&fit=crop', 'general', 'Ảnh banner footer', 'URL hình ảnh banner ở phần footer'),
      ('facebook_url', '', 'social', 'Facebook', 'Link trang Facebook'),
      ('twitter_url', '', 'social', 'Twitter / X', 'Link trang Twitter / X'),
      ('youtube_url', '', 'social', 'Youtube', 'Link kênh Youtube'),
      ('website_url', '', 'social', 'Website', 'Link website khác'),
      ('contact_email', '', 'social', 'Email liên hệ', 'Địa chỉ email liên hệ chung'),
      ('zalo_url', '', 'social', 'Zalo', 'Link Zalo OA'),
      ('tiktok_url', '', 'social', 'TikTok', 'Link kênh TikTok'),
      ('linkedin_url', '', 'social', 'LinkedIn', 'Link trang LinkedIn')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "site_settings"`);
  }
}
