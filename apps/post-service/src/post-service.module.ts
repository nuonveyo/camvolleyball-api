import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, Post, User } from '@app/common';
import { PostServiceController } from './post-service.controller';
import { PostServiceService } from './post-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([Post, User]),
  ],
  controllers: [PostServiceController],
  providers: [PostServiceService],
})
export class PostServiceModule { }
