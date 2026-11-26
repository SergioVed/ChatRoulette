import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCallsToSummaries1795715240017 implements MigrationInterface {
    name = 'AddCallsToSummaries1795715240017';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('LOCK TABLE "summaries" IN ACCESS EXCLUSIVE MODE');
        await queryRunner.query(`DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM "summaries") THEN
                RAISE EXCEPTION 'Cannot link legacy summaries to calls without authoritative participant and start-time data';
            END IF;
        END $$`);

        await queryRunner.query(`CREATE TABLE "calls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userOneId" uuid NOT NULL, "userTwoId" uuid NOT NULL, "skillId" uuid NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "endedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d9171d91f8dd1a649659f1b6a20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "summaries" DROP COLUMN "skillId"`);
        await queryRunner.query(`ALTER TABLE "summaries" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "summaries" ADD "callId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "summaries" ADD CONSTRAINT "UQ_5ab92267def7bb9739bb941e9ed" UNIQUE ("callId")`);
        await queryRunner.query(`ALTER TABLE "calls" ADD CONSTRAINT "FK_66193149bfcc5f0cb98ecf607a9" FOREIGN KEY ("userOneId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "calls" ADD CONSTRAINT "FK_3d9a2a491b48e60bf92bb4a2145" FOREIGN KEY ("userTwoId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "calls" ADD CONSTRAINT "FK_b16d4468f84816ad840c8b305f8" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "summaries" ADD CONSTRAINT "FK_5ab92267def7bb9739bb941e9ed" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('LOCK TABLE "summaries", "calls" IN ACCESS EXCLUSIVE MODE');
        await queryRunner.query(`DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM "calls") OR EXISTS (SELECT 1 FROM "summaries") THEN
                RAISE EXCEPTION 'Cannot revert Call migration while calls or summaries exist';
            END IF;
        END $$`);

        await queryRunner.query(`ALTER TABLE "summaries" DROP CONSTRAINT "FK_5ab92267def7bb9739bb941e9ed"`);
        await queryRunner.query(`ALTER TABLE "calls" DROP CONSTRAINT "FK_b16d4468f84816ad840c8b305f8"`);
        await queryRunner.query(`ALTER TABLE "calls" DROP CONSTRAINT "FK_3d9a2a491b48e60bf92bb4a2145"`);
        await queryRunner.query(`ALTER TABLE "calls" DROP CONSTRAINT "FK_66193149bfcc5f0cb98ecf607a9"`);
        await queryRunner.query(`ALTER TABLE "summaries" DROP CONSTRAINT "UQ_5ab92267def7bb9739bb941e9ed"`);
        await queryRunner.query(`ALTER TABLE "summaries" DROP COLUMN "callId"`);
        await queryRunner.query(`ALTER TABLE "summaries" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "summaries" ADD "skillId" uuid NOT NULL`);
        await queryRunner.query(`DROP TABLE "calls"`);
    }

}
