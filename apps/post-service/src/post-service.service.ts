import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ArrayContains, Raw, In } from 'typeorm';
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
    });
    return this.postRepository.save(post);
  }

  async findAll(payload: PaginationDto & { userId?: string, followingIds?: string[], interestedSectors?: string[] }) {
    const { page = 1, limit = 10, search, tag, userId, followingIds, interestedSectors } = payload;
    const skippedItems = (page - 1) * limit;

    const baseCondition: FindOptionsWhere<Post> = {};
    if (tag) baseCondition.tags = ArrayContains([tag]);
    if (search) baseCondition.contents = Raw((alias) => `${alias}->>'text' ILIKE :search`, { search: `%${search}%` });

    // NEW: Sector Filter
    if (interestedSectors && interestedSectors.length > 0) {
      // Cast to any to avoid TypeORM strict enum checks if needed
      baseCondition.sector = In(interestedSectors as any);
    }

    const where: FindOptionsWhere<Post>[] = [];

    // 1. Public Posts
    where.push({ ...baseCondition, visibility: 'public' });

    // 2. My posts (always visible to me)
    if (userId) {
      where.push({ ...baseCondition, userId });
    }

    // 3. Followed posts (visible if I follow author)
    if (followingIds && followingIds.length > 0) {
      where.push({
        ...baseCondition,
        visibility: 'followers',
        userId: In(followingIds),
      });
    }

    const [data, total] = await this.postRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      relations: ['user', 'user.profile', 'originalPost', 'originalPost.user', 'originalPost.user.profile', 'venue', 'event', 'event.homeTeam', 'event.awayTeam', 'event.venue'],
      take: limit,
      skip: skippedItems,
    });

    const mappedData = data.map(post => {
      const { user, originalPost, deletedAt, userId, event, ...rest } = post; // Exclude deletedAt, userId

      let mappedOriginalPost: any = null;
      if (originalPost) {
        const { user: originalUser, deletedAt: originalDeletedAt, userId: originalUserId, ...originalRest } = originalPost; // Exclude deletedAt, userId
        const originalProfile = originalUser?.profile;
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
          } : null
        };
      }

      const userProfile = user?.profile;

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
        profile: userProfile ? {
          userId: userProfile.userId,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          nickname: userProfile.nickname,
          bio: userProfile.bio,
          level: userProfile.level,
          position: userProfile.position,
          avatarUrl: userProfile.avatarUrl,
        } : null,
        originalPost: mappedOriginalPost,
        event: mappedEvent
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
      relations: ['user', 'user.profile', 'comments', 'comments.user', 'comments.user.profile', 'venue'],
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
        message: `${nickname} comment on your post`,
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
          message: `${nickname} like your post`,
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
        message: `${nickname} share your post`,
      });
    }

    return share;
  }
}
