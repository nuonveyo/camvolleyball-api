import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile, User, Post } from '@app/common';
import { UpdateProfileDto } from './dto/update-profile.dto';


@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserProfile)
        private profileRepository: Repository<UserProfile>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
    ) { }

    async getProfile(userId: string) {
        const profile = await this.profileRepository.findOne({ where: { userId: userId } });
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        const posts = await this.postRepository.find({
            where: { userId: userId },
            order: { createdAt: 'DESC' },
            // relations: [], // No relations needed (raw post data only)
            take: 20, // Limit to recent 20 for profile view (performance)
        });

        return { ...profile, user, posts };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const profile = await this.profileRepository.findOne({ where: { userId: userId } });
        if (!profile) {
            // Create if missing? usually created at register
            throw new NotFoundException('Profile not found');
        }

        Object.assign(profile, dto);
        await this.profileRepository.save(profile);
        return profile;
    }
}
