import { MikroORM } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  constructor(private orm: MikroORM) {}

  async setSchema() {
    const generator = this.orm.getSchemaGenerator();
    const dropDump = await generator.getDropSchemaSQL();
    console.log(dropDump);
    const createDump = await generator.getCreateSchemaSQL();
    console.log(createDump);
    const updateDump = await generator.getUpdateSchemaSQL();
    console.log(updateDump);
    // there is also `generate()` method that returns drop + create queries
    const dropAndCreateDump = await generator.generate();
    console.log(dropAndCreateDump);
  }

  async clearDb() {
    const generator = this.orm.getSchemaGenerator();
    await generator.refreshDatabase(); // ensure db exists and is fresh
    await generator.clearDatabase();
  }
}
