import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1763711707992 implements MigrationInterface {
    name = 'Migrations1763711707992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_by\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`requests\` ADD \`created_by\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_f32b1cb14a9920477bcfd63df2c\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`requests\` ADD CONSTRAINT \`FK_2d487b151e34f5924c3d8adb5da\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`requests\` DROP FOREIGN KEY \`FK_2d487b151e34f5924c3d8adb5da\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_f32b1cb14a9920477bcfd63df2c\``);
        await queryRunner.query(`ALTER TABLE \`requests\` DROP COLUMN \`created_by\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_by\``);
    }

}
