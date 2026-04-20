import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1776715115341 implements MigrationInterface {
  name = 'InitialSchema1776715115341';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "name" text NOT NULL,
                "attributes" text NOT NULL
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "projects" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "name" text NOT NULL,
                "status" text NOT NULL,
                "description" text,
                "created_at" integer NOT NULL,
                "notes" text
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "storage_units" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "barcode" text NOT NULL,
                "name" text NOT NULL,
                "parent_id" integer,
                "notes" text,
                CONSTRAINT "UQ_storage_units_barcode" UNIQUE ("barcode"),
                CONSTRAINT "FK_storage_units_parent" FOREIGN KEY ("parent_id") REFERENCES "storage_units" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "containers" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "barcode" text NOT NULL,
                "name" text NOT NULL,
                "storage_unit_id" integer,
                "project_id" integer,
                "notes" text,
                CONSTRAINT "UQ_containers_barcode" UNIQUE ("barcode"),
                CONSTRAINT "FK_containers_storage_unit" FOREIGN KEY ("storage_unit_id") REFERENCES "storage_units" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
                CONSTRAINT "FK_containers_project" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "items" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "name" text NOT NULL,
                "description" text,
                "category_id" integer,
                "attributes" text NOT NULL DEFAULT ('{}'),
                "quantity" integer NOT NULL DEFAULT (0),
                "min_qty" integer,
                "reorder_qty" integer,
                "unit" text NOT NULL,
                "barcode" text,
                "container_id" integer NOT NULL,
                "notes" text,
                CONSTRAINT "UQ_items_barcode" UNIQUE ("barcode"),
                CONSTRAINT "FK_items_category" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
                CONSTRAINT "FK_items_container" FOREIGN KEY ("container_id") REFERENCES "containers" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "bom_lines" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "project_id" integer NOT NULL,
                "item_id" integer NOT NULL,
                "quantity_required" integer NOT NULL,
                "quantity_pulled" integer NOT NULL DEFAULT (0),
                "quantity_installed" integer NOT NULL DEFAULT (0),
                "notes" text,
                CONSTRAINT "FK_bom_lines_project" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_bom_lines_item" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "supplier_data" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "item_id" integer NOT NULL,
                "supplier" text NOT NULL,
                "supplier_sku" text,
                "url" text,
                "unit_price" real,
                "currency" text NOT NULL DEFAULT ('EUR'),
                "min_order_qty" integer,
                "preferred" integer NOT NULL DEFAULT (0),
                "notes" text,
                "last_fetched" integer,
                "raw_data" text,
                CONSTRAINT "FK_supplier_data_item" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "supplier_data"`);
    await queryRunner.query(`DROP TABLE "bom_lines"`);
    await queryRunner.query(`DROP TABLE "items"`);
    await queryRunner.query(`DROP TABLE "containers"`);
    await queryRunner.query(`DROP TABLE "storage_units"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
