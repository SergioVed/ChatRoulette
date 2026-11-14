import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIconColumnToSkills1794686613524 implements MigrationInterface {
    name = 'AddIconColumnToSkills1794686613524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "skills" ADD "icon" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "skills" DROP COLUMN "icon"`);
    }

}
