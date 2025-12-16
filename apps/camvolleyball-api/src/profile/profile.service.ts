import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile, User, Post, UserFollow } from '@app/common';
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
        @InjectRepository(UserFollow)
        private userFollowRepository: Repository<UserFollow>,
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

        const [posts, postCount, followerCount, followingCount] = await Promise.all([
            this.postRepository.find({
                where: { userId: userId },
                order: { createdAt: 'DESC' },
                // relations: [], // No relations needed (raw post data only)
                take: 20, // Limit to recent 20 for profile view (performance)
            }),
            this.postRepository.count({ where: { userId: userId } }),
            this.userFollowRepository.count({ where: { followingId: userId } }),
            this.userFollowRepository.count({ where: { followerId: userId } }),
        ]);

        return {
            ...profile,
            user,
            posts,
            postCount,
            followerCount,
            followingCount,
        };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const profile = await this.profileRepository.findOne({ where: { userId: userId } });
        if (!profile) {
            // Create if missing? usually created at register
            throw new NotFoundException('Profile not found');
        }

        // remove null or undefined values
        const filteredDto = Object.fromEntries(
            Object.entries(dto).filter(([_, v]) => v !== null && v !== undefined)
        );

        Object.assign(profile, filteredDto);
        await this.profileRepository.save(profile);
        return profile;
    }
}
