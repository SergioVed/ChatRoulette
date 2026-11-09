import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPasswordHash1794086459423 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" ADD "password_hash" varchar NULL');
    await queryRunner.query('CREATE UNIQUE INDEX "UQ_users_normalized_email" ON "users" (lower(trim("email")))');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "UQ_users_normalized_email"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "password_hash"');
  }
}
