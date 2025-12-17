import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ArrayContains, Raw, In } from 'typeorm';
import { Post, CreatePostDto, UpdatePostDto, User, PaginationDto, Comment, Like, Share, CreateCommentDto, NotificationType } from '@app/common';
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
    });
    return this.postRepository.save(post);
  }

  async findAll(payload: PaginationDto & { userId?: string, followingIds?: string[] }) {
    const { page = 1, limit = 10, search, tag, userId, followingIds } = payload;
    const skippedItems = (page - 1) * limit;

    const where: FindOptionsWhere<Post> | FindOptionsWhere<Post>[] = [];

    // Base conditions
    const baseCondition: FindOptionsWhere<Post> = {};
    if (tag) baseCondition.tags = ArrayContains([tag]);
    if (search) baseCondition.contents = Raw((alias) => `${alias}->>'text' ILIKE :search`, { search: `%${search}%` });

    // Public posts
    where.push({ ...baseCondition, visibility: 'public' });

    // My posts (always visible to me)
    if (userId) {
      where.push({ ...baseCondition, userId });
    }

    // Followed posts (visible if I follow author)
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
      relations: ['user', 'user.profile'],
      take: limit,
      skip: skippedItems,
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.postRepository.findOne({
      where: { id },
      relations: ['user', 'user.profile', 'comments', 'comments.user', 'comments.user.profile'],
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

  async sharePost(dto: { postId: string, userId: string }) {
    const share = this.shareRepository.create({ postId: dto.postId, userId: dto.userId });
    await this.shareRepository.save(share);
    await this.postRepository.increment({ id: dto.postId }, 'sharesCount', 1);

    // Notify Post Owner
    const post = await this.postRepository.findOne({ where: { id: dto.postId } });
    if (post && post.userId !== dto.userId) {
      const actor = await this.userRepository.findOne({ where: { id: dto.userId }, relations: ['profile'] });
      const nickname = actor?.profile?.nickname || 'Someone';

      this.notificationsClient.emit('notify_user', {
        recipientId: post.userId,
        actorId: dto.userId,
        type: NotificationType.SHARE,
        entityId: dto.postId,
        message: `${nickname} share your post`,
      });
    }

    return share;
  }
}
