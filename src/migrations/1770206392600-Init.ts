import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1770206392600 implements MigrationInterface {
    name = 'Init1770206392600'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "farms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text NOT NULL, "location" character varying(255) NOT NULL, "logo_url" character varying(500), "is_organic_certified" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "rating" numeric(2,1) NOT NULL DEFAULT '0', "total_reviews" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_875a28c6cf6e348fc49b3cf87c1" UNIQUE ("name"), CONSTRAINT "PK_39aff9c35006b14025bba5a43d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_farms_slug_unique" ON "farms" ("slug") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "image_url" character varying(500), "parent_id" uuid, "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_categories_parent_id" ON "categories" ("parent_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_categories_slug_unique" ON "categories" ("slug") `);
        await queryRunner.query(`CREATE TYPE "public"."product_unit_enum" AS ENUM('kg', 'g', 'l', 'ml', 'pcs')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "farm_id" uuid NOT NULL, "category_id" uuid, "sku" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "price_cents" integer NOT NULL, "compare_at_price_cents" integer, "stock" integer NOT NULL DEFAULT '0', "unit" "public"."product_unit_enum" NOT NULL DEFAULT 'pcs', "is_organic" boolean NOT NULL DEFAULT false, "harvest_date" date, "expires_at" date, "image_url" character varying(500), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "CHK_price_cents_positive" CHECK ("price_cents" >= 0), CONSTRAINT "CHK_stock_positive" CHECK ("stock" >= 0), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_products_is_active" ON "products" ("is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_products_category_id" ON "products" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_products_farm_id" ON "products" ("farm_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_products_name" ON "products" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_products_sku_unique" ON "products" ("sku") `);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "product_name_snapshot" character varying(255) NOT NULL, "price_cents_snapshot" integer NOT NULL, "farm_name_snapshot" character varying(255) NOT NULL, "line_total_cents" integer NOT NULL, CONSTRAINT "CHK_quantity_non_negative" CHECK ("quantity" > 0), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_order_items_product_id" ON "order_items" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id") `);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "idempotency_key" character varying(120) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "total_cents" integer NOT NULL DEFAULT '0', "discount_cents" integer NOT NULL DEFAULT '0', "delivery_cents" integer NOT NULL DEFAULT '0', "final_cents" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_orders_user_idempotency" ON "orders" ("user_id", "idempotency_key") `);
        await queryRunner.query(`CREATE INDEX "IDX_orders_created_at" ON "orders" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_orders_user_id" ON "orders" ("user_id") `);
        await queryRunner.query(`CREATE TYPE "public"."user_roles_enum" AS ENUM('customer', 'admin', 'farmer')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "phone" character varying(20), "role" "public"."user_roles_enum" NOT NULL DEFAULT 'customer', "farm_id" uuid, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_users_farm_id" ON "users" ("farm_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_email_unique" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_dc27ebbc3adade7318be482d9c6" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_f647057de48f1c96c1d9eef580b" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_f647057de48f1c96c1d9eef580b"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_dc27ebbc3adade7318be482d9c6"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_email_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_farm_id"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_orders_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_orders_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_orders_user_idempotency"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_order_items_order_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_order_items_product_id"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_products_sku_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_products_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_products_farm_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_products_category_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_products_is_active"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."product_unit_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_categories_slug_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_categories_parent_id"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_farms_slug_unique"`);
        await queryRunner.query(`DROP TABLE "farms"`);
    }

}
