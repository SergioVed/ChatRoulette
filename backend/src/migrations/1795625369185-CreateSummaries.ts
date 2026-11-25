import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSummaries1795625369185 implements MigrationInterface {
    name = 'CreateSummaries1795625369185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "summaries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" text NOT NULL, "skillId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_448e2a87db98ce2a6ee8946f392" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "summaries"`);
    }

}
