import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, CreatePostDto, UpdatePostDto, User, PaginationDto, Comment, Like, Share, CreateCommentDto, NotificationType, CreateShareDto } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PostServiceService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Share)
    private shareRepository: Repository<Share>,
    @Inject('NOTIFICATIONS_SERVICE') private notificationsClient: ClientProxy,
  ) { }

  async create(dto: CreatePostDto) {
    const post = this.postRepository.create({
      userId: dto.userId,
      contents: dto.contents,
      tags: dto.tags,
      visibility: dto.visibility,
      venueId: dto.venueId,
      sector: dto.sector,
      eventId: dto.eventId,
      newsId: dto.newsId, // Add newsId
    });
    return this.postRepository.save(post);
  }

  async findAll(payload: PaginationDto & { userId?: string, followingIds?: string[], interestedSectors?: string[] }) {
    const { page = 1, limit = 10, userId, followingIds, interestedSectors } = payload;
    const skippedItems = (page - 1) * limit;

    const query = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('post.originalPost', 'originalPost')
      .leftJoinAndSelect('originalPost.user', 'originalPostUser')
      .leftJoinAndSelect('originalPostUser.profile', 'originalPostUserProfile')
      .leftJoinAndSelect('post.venue', 'venue')
      .leftJoinAndSelect('post.event', 'event')
      .leftJoinAndSelect('event.homeTeam', 'homeTeam')
      .leftJoinAndSelect('event.awayTeam', 'awayTeam')
      .leftJoinAndSelect('event.venue', 'eventVenue')
      .leftJoinAndSelect('post.news', 'news'); // Join News

    // Visibility Logic:
    // 1. All Public Posts
    // 2. My Own Posts
    // 3. Followed Posts (Visibility = 'followers')
    query.where('post.visibility = :public', { public: 'public' });

    if (userId) {
      query.orWhere('post.userId = :userId', { userId });

      if (followingIds && followingIds.length > 0) {
        query.orWhere(
          '(post.userId IN (:...followingIds) AND post.visibility = :followers)',
          { followingIds, followers: 'followers' }
        );
      }
    }

    // Sorting Logic:
    // 1. Interested Sectors First
    // 2. CreatedAt Desc
    if (interestedSectors && interestedSectors.length > 0) {
      query.addSelect(
        `CASE WHEN post.sector IN (:...interestedSectors) THEN 0 ELSE 1 END`,
        'priority'
      );
      query.setParameter('interestedSectors', interestedSectors);
      query.addOrderBy('priority', 'ASC');
    }

    query.addOrderBy('post.createdAt', 'DESC');
    query.take(limit);
    query.skip(skippedItems);

    // Fetch posts
    const [data, total] = await query.getManyAndCount();

    // Fetch likes for the current user for these posts (Optimize N+1)
    let likedPostIds = new Set<string>();
    if (userId && data.length > 0) {
      const postIds = data.map(p => p.id);
      const likes = await this.likeRepository.createQueryBuilder('like')
        .where('like.userId = :userId', { userId })
        .andWhere('like.postId IN (:...postIds)', { postIds })
        .select(['like.postId'])
        .getMany();
      likedPostIds = new Set(likes.map(l => l.postId));
    }

    const followingSet = new Set(followingIds || []);

    const mappedData = data.map(post => {
      const { user, originalPost, deletedAt, userId: postUserId, event, ...rest } = post; // Exclude deletedAt, userId

      let mappedOriginalPost: any = null;
      if (originalPost) {
        const { user: originalUser, deletedAt: originalDeletedAt, userId: originalUserId, ...originalRest } = originalPost;
        const originalProfile = originalUser?.profile;
        // Check if current user follows original post author
        const isFollowingOriginal = originalUserId === userId ? false : followingSet.has(originalUserId);

        mappedOriginalPost = {
          ...originalRest,
          profile: originalProfile ? {
            userId: originalProfile.userId,
            firstName: originalProfile.firstName,
            lastName: originalProfile.lastName,
            nickname: originalProfile.nickname,
            bio: originalProfile.bio,
            level: originalProfile.level,
            position: originalProfile.position,
            avatarUrl: originalProfile.avatarUrl,
            isFollowing: isFollowingOriginal,
          } : null
        };
      }

      const userProfile = user?.profile;
      // Check if current user follows post author
      const isFollowing = postUserId === userId ? false : followingSet.has(postUserId);

      // Map Event Data (Only necessary fields)
      let mappedEvent: any = null;
      if (event) {
        mappedEvent = {
          id: event.id,
          title: event.title,
          matchDate: event.matchDate,
          matchType: event.matchType,
          venue: event.venue ? {
            id: event.venue.id,
            name: event.venue.name,
            city: event.venue.city
          } : null,
          homeTeam: event.homeTeam ? {
            id: event.homeTeam.id,
            name: event.homeTeam.name,
            logoUrl: event.homeTeam.logoUrl,
            rating: event.homeTeam.rating
          } : null,
          awayTeam: event.awayTeam ? {
            id: event.awayTeam.id,
            name: event.awayTeam.name,
            logoUrl: event.awayTeam.logoUrl,
            rating: event.awayTeam.rating
          } : null
        };
      }

      return {
        ...rest,
        isLike: likedPostIds.has(post.id),
        profile: userProfile ? {
          userId: userProfile.userId,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          nickname: userProfile.nickname,
          bio: userProfile.bio,
          level: userProfile.level,
          position: userProfile.position,
          avatarUrl: userProfile.avatarUrl,
          isFollowing: isFollowing,
        } : null,
        originalPost: mappedOriginalPost,
        event: mappedEvent,
        news: post.news, // Return news object directly
      };
    });

    return {
      data: mappedData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.postRepository.findOne({
      where: { id },
      relations: ['user', 'user.profile', 'comments', 'comments.user', 'comments.user.profile', 'venue', 'event', 'news'],
    });
  }

  async update(dto: UpdatePostDto) {
    const post = await this.postRepository.findOne({ where: { id: dto.id, userId: dto.userId } });
    if (!post) {
      throw new Error('Post not found or unauthorized');
    }
    if (dto.contents) post.contents = dto.contents;
    if (dto.tags) post.tags = dto.tags;
    if (dto.visibility) post.visibility = dto.visibility;
    return this.postRepository.save(post);
  }

  async remove(id: string, userId: string) {
    const post = await this.postRepository.findOne({ where: { id, userId } });
    if (!post) {
      throw new Error('Post not found or unauthorized');
    }
    return this.postRepository.softDelete(id);
  }

  async addComment(dto: CreateCommentDto) {
    const comment = this.commentRepository.create({
      contents: dto.contents,
      postId: dto.postId,
      userId: dto.userId,
    });
    const saved = await this.commentRepository.save(comment);

    // Update count
    await this.postRepository.increment({ id: dto.postId }, 'commentsCount', 1);

    // Notify Post Owner
    const post = await this.postRepository.findOne({ where: { id: dto.postId } });
    if (post && post.userId !== dto.userId) {
      const actor = await this.userRepository.findOne({ where: { id: dto.userId }, relations: ['profile'] });
      const nickname = actor?.profile?.nickname || 'Someone';

      this.notificationsClient.emit('notify_user', {
        recipientId: post.userId,
        actorId: dto.userId,
        type: NotificationType.COMMENT,
        entityId: dto.postId,
        message: 'comment on your post',
        actorName: nickname, // Send nickname separately
      });
    }

    return saved;
  }

  async findComments(postId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skippedItems = (page - 1) * limit;

    const [data, total] = await this.commentRepository.findAndCount({
      where: { postId },
      order: { createdAt: 'DESC' },
      relations: ['user', 'user.profile'],
      take: limit,
      skip: skippedItems,
    });

    const transformedData = data.map((comment) => {
      const { user, deletedAt, ...rest } = comment;
      return {
        ...rest,
        profile: {
          userId: comment.userId,
          nickname: user?.profile?.nickname || null,
          avatarUrl: user?.profile?.avatarUrl || null,
          level: user?.profile?.level || null,
        },
      };
    });

    return {
      data: transformedData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async toggleLike(dto: { postId: string, userId: string }) {
    const existingLike = await this.likeRepository.findOne({ where: { postId: dto.postId, userId: dto.userId } });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      await this.postRepository.decrement({ id: dto.postId }, 'likesCount', 1);
      return { liked: false };
    } else {
      const like = this.likeRepository.create({ postId: dto.postId, userId: dto.userId });
      await this.likeRepository.save(like);
      await this.postRepository.increment({ id: dto.postId }, 'likesCount', 1);

      // Notify Post Owner
      const post = await this.postRepository.findOne({ where: { id: dto.postId } });
      if (post && post.userId !== dto.userId) {
        const actor = await this.userRepository.findOne({ where: { id: dto.userId }, relations: ['profile'] });
        const nickname = actor?.profile?.nickname || 'Someone';

        this.notificationsClient.emit('notify_user', {
          recipientId: post.userId,
          actorId: dto.userId,
          type: NotificationType.LIKE,
          entityId: dto.postId,
          message: 'like your post',
          actorName: nickname, // Send nickname separately
        });
      }

      return { liked: true };
    }
  }

  async sharePost(dto: CreateShareDto) {
    // 1. Verify original post exists
    const originalPost = await this.postRepository.findOne({ where: { id: dto.postId } });
    if (!originalPost) {
      throw new Error('Original post not found');
    }

    // 2. Create the Share record (for analytics/history)
    const share = this.shareRepository.create({
      postId: dto.postId,
      userId: dto.userId,
      description: dto.description,
    });
    await this.shareRepository.save(share);

    // 3. Create a NEW Post to represent this share in the feed
    // This allows the share to appear in timelines just like a normal post
    const newPost = this.postRepository.create({
      userId: dto.userId,
      originalPostId: dto.postId,
      contents: dto.description ? { text: dto.description } : null,
      visibility: 'public', // Default to public for shares for now
      tags: [], // Could copy tags if needed, but leaving empty for now
      sector: originalPost.sector, // Inherit sector from original post
    });
    await this.postRepository.save(newPost);

    // 4. Update stats on original post
    await this.postRepository.increment({ id: dto.postId }, 'sharesCount', 1);

    // 5. Notify Post Owner
    if (originalPost && originalPost.userId !== dto.userId) {
      const actor = await this.userRepository.findOne({ where: { id: dto.userId }, relations: ['profile'] });
      const nickname = actor?.profile?.nickname || 'Someone';

      this.notificationsClient.emit('notify_user', {
        recipientId: originalPost.userId, // Use originalPost.userId directly
        actorId: dto.userId,
        type: NotificationType.SHARE,
        entityId: dto.postId,
        message: 'share your post',
        actorName: nickname, // Send nickname separately
      });
    }

    return share;
  }
}
