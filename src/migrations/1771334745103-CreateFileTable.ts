import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileTable1771334745103 implements MigrationInterface {
  name = 'CreateFileTable1771334745103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."file_entity_type_enum" AS ENUM('product', 'user', 'farm')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."file_status_enum" AS ENUM('pending', 'ready')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."file_visibility_enum" AS ENUM('private', 'public')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."file_kind_enum" AS ENUM('avatar', 'image', 'logo', 'photo')`,
    );
    await queryRunner.query(
      `CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" uuid NOT NULL, "entity_type" "public"."file_entity_type_enum" NOT NULL, "entity_id" uuid, "object_key" character varying(512) NOT NULL, "content_type" character varying(120) NOT NULL, "size_bytes" integer NOT NULL, "file_status" "public"."file_status_enum" NOT NULL DEFAULT 'pending', "visibility" "public"."file_visibility_enum" NOT NULL DEFAULT 'public', "kind" "public"."file_kind_enum" NOT NULL, "completed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_files_status" ON "files" ("file_status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_files_object_key" ON "files" ("object_key") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_files_entity" ON "files" ("entity_type", "entity_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_files_owner_id" ON "files" ("owner_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_4bc1db1f4f34ec9415acd88afdb" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_4bc1db1f4f34ec9415acd88afdb"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_files_owner_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_files_entity"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_files_object_key"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_files_status"`);
    await queryRunner.query(`DROP TABLE "files"`);
    await queryRunner.query(`DROP TYPE "public"."file_kind_enum"`);
    await queryRunner.query(`DROP TYPE "public"."file_visibility_enum"`);
    await queryRunner.query(`DROP TYPE "public"."file_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."file_entity_type_enum"`);
  }
}
