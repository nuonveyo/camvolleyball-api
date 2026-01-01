import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile, User, Post, UserFollow } from '@app/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { SocialModule } from '../social/social.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserProfile, User, Post, UserFollow]),
        SocialModule, // Import SocialModule
    ],
    controllers: [ProfileController],
    providers: [ProfileService],
    exports: [ProfileService],
})
export class ProfileModule { }
