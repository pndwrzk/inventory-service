import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1763717539683 implements MigrationInterface {
    name = 'Migrations1763717539683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`requests\` ADD \`code\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`requests\` ADD UNIQUE INDEX \`IDX_7e107146f8defa7286a86e37c9\` (\`code\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`requests\` DROP INDEX \`IDX_7e107146f8defa7286a86e37c9\``);
        await queryRunner.query(`ALTER TABLE \`requests\` DROP COLUMN \`code\``);
    }

}
