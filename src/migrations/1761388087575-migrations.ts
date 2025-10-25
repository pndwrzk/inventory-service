import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1761388087575 implements MigrationInterface {
    name = 'Migrations1761388087575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`attachments\` ADD \`request_status_history_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`attachments\` ADD CONSTRAINT \`FK_009dd5b64c858fd59f706536a96\` FOREIGN KEY (\`request_status_history_id\`) REFERENCES \`request_status_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`attachments\` DROP FOREIGN KEY \`FK_009dd5b64c858fd59f706536a96\``);
        await queryRunner.query(`ALTER TABLE \`attachments\` DROP COLUMN \`request_status_history_id\``);
    }

}
