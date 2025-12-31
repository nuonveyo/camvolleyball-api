import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile, User, Post, UserFollow } from '@app/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SocialService } from '../social/social.service';
import { PaginationDto } from '@app/common';


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
        private readonly socialService: SocialService, // Inject SocialService
    ) { }

    async getProfile(userId: string) {
        const profile = await this.profileRepository.findOne({ where: { userId: userId } });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        const [posts, postCount, followerCount, followingCount] = await Promise.all([
            this.postRepository.createQueryBuilder('post')
                .where('post.userId = :userId', { userId })
                .andWhere(
                    "(post.contents->'images' IS NOT NULL AND jsonb_typeof(post.contents->'images') = 'array' AND jsonb_array_length(post.contents->'images') > 0) OR (post.contents->'videos' IS NOT NULL AND jsonb_typeof(post.contents->'videos') = 'array' AND jsonb_array_length(post.contents->'videos') > 0)"
                )
                .orderBy('post.createdAt', 'DESC')
                .take(20)
                .getMany(),
            this.postRepository.count({ where: { userId: userId } }),
            this.userFollowRepository.count({ where: { followingId: userId } }),
            this.userFollowRepository.count({ where: { followerId: userId } }),
        ]);

        const { deletedAt, ...profileData } = profile;

        const sanitizedPosts = posts.map(post => {
            const { deletedAt, ...postData } = post;
            return postData;
        });

        return {
            ...profileData,
            posts: sanitizedPosts,
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

    async findAll(paginationDto: PaginationDto, currentUserId?: string) {
        const { page = 1, limit = 10 } = paginationDto;
        const skippedItems = (page - 1) * limit;

        const [profiles, total] = await this.profileRepository.findAndCount({
            take: limit,
            skip: skippedItems,
            order: { firstName: 'ASC' } // Default sorting
        });

        let followingIds = new Set<string>();
        if (currentUserId) {
            const ids = await this.socialService.getFollowingIds(currentUserId);
            followingIds = new Set(ids);
        }

        const mappedProfiles = profiles.map(profile => {
            const isFollowing = currentUserId ? (profile.userId === currentUserId ? false : followingIds.has(profile.userId)) : false;
            return {
                ...profile,
                isFollowing
            };
        });

        return {
            data: mappedProfiles,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }
}
