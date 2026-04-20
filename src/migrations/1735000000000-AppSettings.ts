import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppSettings1735000000000 implements MigrationInterface {
  name = 'AppSettings1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "app_settings" (
                "key" text PRIMARY KEY NOT NULL,
                "value" text NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "app_settings"`);
  }
}
