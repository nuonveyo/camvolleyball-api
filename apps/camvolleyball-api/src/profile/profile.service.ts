import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile, User } from '@app/common';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserProfile)
        private profileRepository: Repository<UserProfile>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async getProfile(userId: string) {
        const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        return { ...profile, user };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
        if (!profile) {
            // Create if missing? usually created at register
            throw new NotFoundException('Profile not found');
        }

        Object.assign(profile, dto);
        await this.profileRepository.save(profile);
        return profile;
    }
}
