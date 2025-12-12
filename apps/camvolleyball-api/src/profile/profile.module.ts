import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile, User } from '@app/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserProfile, User])],
    controllers: [ProfileController],
    providers: [ProfileService],
})
export class ProfileModule { }
