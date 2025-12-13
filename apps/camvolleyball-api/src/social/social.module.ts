import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserFollow } from '@app/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if SocialController uses guards needing JwtStrategy/Auth safeguards, but standard Guards usually okay. 
// Actually SocialController uses JwtAuthGuard which relies on JwtStrategy. 
// But JwtStrategy is provider in AuthModule. 
// Standard JwtGuard just needs PassportModule/entries properly configured globally or imported. 

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserFollow]),
        // AuthModule // Optional if guards are global or passport is shared
    ],
    controllers: [SocialController],
    providers: [SocialService],
    exports: [SocialService],
})
export class SocialModule { }
