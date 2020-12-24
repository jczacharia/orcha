import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';

@Module({
  imports: [
    AppModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: '1Qazxsw2',
      database: 'e2e-kirtan',
      synchronize: true,
      autoLoadEntities: true,
      ssl: false,
    }),
  ],
})
export class AppTestModule {}
