import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserRoles1770816258875 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM (
        'customer', 'farmer', 'pending_farmer', 'admin', 'support'
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "roles" "user_role_enum"[]
      DEFAULT '{customer}'
    `);

    await queryRunner.query(`
      UPDATE "users"
      SET "roles" = ARRAY["role"::"text"::"user_role_enum"]
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "role"
    `);

    await queryRunner.query(`
      DROP TYPE "user_roles_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_roles_enum" AS ENUM (
        'customer', 'admin', 'farmer'
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "role" "user_roles_enum"
      DEFAULT 'customer'
    `);

    await queryRunner.query(`
      UPDATE "users"
      SET "role" = CASE
        WHEN "roles"[1]::text IN ('customer', 'admin', 'farmer')
        THEN "roles"[1]::text::"user_roles_enum"
        ELSE 'customer'::"user_roles_enum"
      END
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "roles"
    `);

    await queryRunner.query(`
      DROP TYPE "user_role_enum"
    `);
  }
}
