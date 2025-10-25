import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1761376856860 implements MigrationInterface {
    name = 'Migrations1761376856860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('branch', 'staff', 'supervisor', 'superadmin') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('branch', 'staff', 'supervisor') NOT NULL`);
    }

}
