import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIndustryEnum1706901234567 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, update any invalid values to 'other'
    await queryRunner.query(`
            UPDATE companies 
            SET industry = 'other' 
            WHERE industry NOT IN ('finance', 'e-commerce', 'technology', 'healthcare', 'other')
        `);

    // Then modify the column
    await queryRunner.query(`
            ALTER TABLE companies 
            MODIFY COLUMN industry ENUM('finance', 'e-commerce', 'technology', 'healthcare', 'other') 
            NOT NULL DEFAULT 'other'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE companies 
            MODIFY COLUMN industry ENUM('finance', 'e-commerce') 
            NOT NULL
        `);
  }
}
