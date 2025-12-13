import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, CreatePostDto, UpdatePostDto, User, PaginationDto, Comment, Like, Share, CreateCommentDto } from '@app/common';

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
  ) { }

  async create(dto: CreatePostDto) {
    const post = this.postRepository.create({
      userId: dto.userId,
      description: dto.description,
      imageUrl: dto.imageUrl,
    });
    return this.postRepository.save(post);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skippedItems = (page - 1) * limit;

    const [data, total] = await this.postRepository.findAndCount({
      order: { createdAt: 'DESC' },
      relations: ['user', 'user.profile'],
      take: limit,
      skip: skippedItems,
    });

    // Populate likes/comments counts or load relations if needed.
    // Ideally we would use loadRelationCountAndMap or QueryBuilder but keeping simple.
    // Entities have likesCount columns, we should increment them on actions.
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
    if (dto.description) post.description = dto.description;
    if (dto.imageUrl) post.imageUrl = dto.imageUrl;
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
      message: dto.message,
      postId: dto.postId,
      userId: dto.userId,
    });
    const saved = await this.commentRepository.save(comment);

    // Update count
    await this.postRepository.increment({ id: dto.postId }, 'commentsCount', 1);

    return saved;
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
      return { liked: true };
    }
  }

  async sharePost(dto: { postId: string, userId: string }) {
    const share = this.shareRepository.create({ postId: dto.postId, userId: dto.userId });
    await this.shareRepository.save(share);
    await this.postRepository.increment({ id: dto.postId }, 'sharesCount', 1);
    return share;
  }
}
