import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSkills1794671492623 implements MigrationInterface {
    name = 'CreateSkills1794671492623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_81f05095507fd84aa2769b4a522" UNIQUE ("name"), CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_skills_role_enum" AS ENUM('teacher', 'student')`);
        await queryRunner.query(`CREATE TABLE "user_skills" ("userId" uuid NOT NULL, "skillId" uuid NOT NULL, "role" "public"."user_skills_role_enum" NOT NULL, CONSTRAINT "PK_060bea7fd45868588324719de3c" PRIMARY KEY ("userId", "skillId"))`);
        await queryRunner.query(`ALTER TABLE "user_skills" ADD CONSTRAINT "FK_60177dd93dcdc055e4eaa93bade" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_skills" ADD CONSTRAINT "FK_b19f190afaada3852e0f56566bc" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_skills" DROP CONSTRAINT "FK_b19f190afaada3852e0f56566bc"`);
        await queryRunner.query(`ALTER TABLE "user_skills" DROP CONSTRAINT "FK_60177dd93dcdc055e4eaa93bade"`);
        await queryRunner.query(`DROP TABLE "user_skills"`);
        await queryRunner.query(`DROP TYPE "public"."user_skills_role_enum"`);
        await queryRunner.query(`DROP TABLE "skills"`);
    }

}
