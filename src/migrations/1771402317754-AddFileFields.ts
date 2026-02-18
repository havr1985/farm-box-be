import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileFields1771402317754 implements MigrationInterface {
  name = 'AddFileFields1771402317754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "farms" DROP COLUMN "logo_url"`);
    await queryRunner.query(`ALTER TABLE "farms" ADD "logo_file_id" uuid`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image_url"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "main_image_file_id" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "avatar_file_id" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_products_main_image_file_id" ON "products" ("main_image_file_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ADD CONSTRAINT "FK_farms_logo_file" FOREIGN KEY ("logo_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_main_image_file" FOREIGN KEY ("main_image_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_avatar_file" FOREIGN KEY ("avatar_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_avatar_file"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_products_main_image_file"`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" DROP CONSTRAINT "FK_farms_logo_file"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_products_main_image_file_id"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar_file_id"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "main_image_file_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "image_url" character varying(500)`,
    );
    await queryRunner.query(`ALTER TABLE "farms" DROP COLUMN "logo_file_id"`);
    await queryRunner.query(
      `ALTER TABLE "farms" ADD "logo_url" character varying(500)`,
    );
  }
}
