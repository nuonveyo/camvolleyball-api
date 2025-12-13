import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFollow, User } from '@app/common';

@Injectable()
export class SocialService {
    constructor(
        @InjectRepository(UserFollow)
        private userFollowRepository: Repository<UserFollow>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async followUser(followerId: string, followingId: string) {
        if (followerId === followingId) {
            throw new ConflictException('You cannot follow yourself');
        }

        const followingUser = await this.userRepository.findOne({ where: { id: followingId } });
        if (!followingUser) {
            throw new NotFoundException('User to follow not found');
        }

        const existingFollow = await this.userFollowRepository.findOne({
            where: { followerId, followingId },
        });

        if (existingFollow) {
            return { message: 'Already following', status: 'existing' };
        }

        const follow = this.userFollowRepository.create({
            followerId,
            followingId,
        });

        await this.userFollowRepository.save(follow);
        return { message: 'Followed successfully', status: 'success' };
    }

    async unfollowUser(followerId: string, followingId: string) {
        const follow = await this.userFollowRepository.findOne({
            where: { followerId, followingId },
        });

        if (!follow) {
            throw new NotFoundException('Not currently following this user');
        }

        await this.userFollowRepository.remove(follow);
        return { message: 'Unfollowed successfully' };
    }


    async getFollowers(userId: string) {
        const follows = await this.userFollowRepository.find({
            where: { followingId: userId },
            relations: ['follower', 'follower.profile'],
        });
        return follows.map(f => f.follower);
    }

    async getFollowing(userId: string) {
        const follows = await this.userFollowRepository.find({
            where: { followerId: userId },
            relations: ['following', 'following.profile'],
        });
        return follows.map(f => f.following);
    }

    async getFollowingIds(userId: string): Promise<string[]> {
        const follows = await this.userFollowRepository.find({
            where: { followerId: userId },
            select: ['followingId'],
        });
        return follows.map(f => f.followingId);
    }
}
